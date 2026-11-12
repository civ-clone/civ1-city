import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  AvailableSpecialistRegistry,
  instance as availableSpecialistRegistryInstance,
} from '@civ-clone/core-city/AvailableSpecialistRegistry';
import {
  SpecialistRegistry,
  instance as specialistRegistryInstance,
} from '@civ-clone/core-city/SpecialistRegistry';
import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import Captured from '@civ-clone/core-city/Rules/Captured';
import { InciteRevolt } from '@civ-clone/civ1-unit/Actions';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { KEEP_BUILD_RULE } from '../../RuleIds';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import clearCapturedBuild from '../../lib/capturedBuild';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';
import { reassignWorkers } from '../../lib/assignWorkers';
import {
  instance as playerWorldRegistryInstance,
  PlayerWorldRegistry,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  instance as workedTileRegistryInstance,
  WorkedTileRegistry,
} from '@civ-clone/core-city/WorkedTileRegistry';

export const getRules: (
  cityRegistry?: CityRegistry,
  unitRegistry?: UnitRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  engine?: Engine,
  playerWorldRegistry?: PlayerWorldRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  clientRegistry?: ClientRegistry
) => Captured[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  engine: Engine = engineInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance
): Captured[] => [
  new Captured(
    // As v474.05 (civd `CAPTURE.C` `capunit()`: `townbuf[b].shield_box = 0;`).
    'civ1-city:city/captured/reset-build-progress',
    new Effect((capturedCity: City): void =>
      cityBuildRegistry.getByCity(capturedCity).progress().set(0)
    )
  ),
  new Captured(
    // Auto is the previous owner's standing order, not the city's (civ-clone/web-renderer#194). As v474.05, whose
    //  `townbuf[b].status &= CITY_CAPTURE_MASK;` (0xae) clears `CITY_AUTO_BUILD` (0x10).
    'civ1-city:city/captured/stop-auto',
    new Effect((capturedCity: City): void =>
      cityBuildRegistry.getByCity(capturedCity).setAuto(false)
    )
  ),
  // v474.05 (civd `CAPTURE.C` `capunit()`, civ-clone/web-renderer#954) has a computer player that takes a city choose
  //  afresh, and the human keep the item, its shields gone (`townbuf[b].shield_box = 0;` above, `reset-build-progress`):
  //
  //      if (a == civnow) {
  //          city_process(b, 1L);
  //          sel_player();
  //      } else {
  //          townbuf[b].production = UTYPE_SETTLERS;
  //          townbuf[b].production = find_slot(a, b);
  //
  //  A new owner pays its own price for the item (`CITYMGT.C` `city_process()` sets `cost_scale` from the city's owner
  //  each turn).
  new Captured(
    // A computer player that takes a city chooses its build again, as `find_slot` does. After `stop-auto`, so the
    //  `BuildingCancelled` rules don't choose for the city.
    'civ1-city:city/captured/clear-build',
    new Criterion(
      (capturedCity: City, capturingPlayer: Player): boolean =>
        !isHuman(capturingPlayer, clientRegistry)
    ),
    new Effect((capturedCity: City): void =>
      clearCapturedBuild(cityBuildRegistry.getByCity(capturedCity))
    )
  ),
  new Captured(
    // The human keeps what the city was building, at the human's price, and so may finish an item they could not
    //  choose (civ-clone/web-renderer#670). Asked for as a captured city's if nothing was being built
    //  (civ-clone/web-renderer#716). `civ1-enhanced` clears the build for the human too, taking this rule's place while
    //  its set is on.
    KEEP_BUILD_RULE,
    new Criterion((capturedCity: City, capturingPlayer: Player): boolean =>
      isHuman(capturingPlayer, clientRegistry)
    ),
    new Effect((capturedCity: City): void => {
      const cityBuild = cityBuildRegistry.getByCity(capturedCity);

      if (cityBuild.building() === null) {
        cityBuild.setCleared('captured');

        return;
      }

      // The previous owner's queue goes, as it does when the build is cleared: v474.05 has none.
      cityBuild.clearQueue();
      cityBuild.reprice();
    })
  ),
  // A captured city loses a citizen, so one of size 1 is destroyed; but a city incited to revolt (or subverted) by a
  //  Diplomat loses one only when it has one to spare, and so is never destroyed (civ-clone/web-renderer#969). v474.05
  //  `CAPTURE.C` `capunit(a, b, c)`, which `city_revolt` (`DIPLOMAT.C`) calls with `c` set (`capunit(new_owner,
  //  city_id, 1L);`, the flag `incited` "city taken by a diplomat: capture, never destroy" set around it), and a
  //  conquest (`CONTROL.C`) with it clear:
  //
  //  ```c
  //  if (c == 0 || townbuf[b].f7 > 1)
  //      if (--townbuf[b].f7 == 0)
  //          vanish(b, x, y);
  //  ```
  //
  //  (`f7` is the city's size in `CAPTURE.C`'s view of `townbuf`.)
  new Captured(
    'civ1-city:city/captured/shrink',
    new Criterion(
      (
        capturedCity: City,
        capturingPlayer: Player,
        player: Player,
        cause: unknown
      ): boolean =>
        !(cause instanceof InciteRevolt) ||
        cityGrowthRegistry.getByCity(capturedCity).size() > 1
    ),
    new Effect((capturedCity: City): void =>
      cityGrowthRegistry.getByCity(capturedCity).shrink(Captured)
    )
  ),
  new Captured(
    'civ1-city:city/captured/emit',
    new Effect(
      (capturedCity: City, capturingPlayer: Player, player: Player): void => {
        engine.emit('city:captured', capturedCity, capturingPlayer, player);
      }
    )
  ),
  new Captured(
    'civ1-city:city/captured/destroy-supported-units',
    // Not the units now the capturer's, which defected with an incited city (civ-clone/web-renderer#58). After a
    //  conquest there are none.
    new Effect((capturedCity: City, capturingPlayer: Player): void =>
      unitRegistry
        .getByCity(capturedCity)
        .filter((unit: Unit): boolean => unit.player() !== capturingPlayer)
        .forEach((unit: Unit): void => {
          // Not one the disbanding of another took with it already: when the city was its player's last, the first
          //  unit to go defeats the player, which destroys the rest (civ-clone/web-renderer#600).
          if (unit.destroyed()) {
            return;
          }

          unit.destroy();
        })
    )
  ),
  new Captured(
    'civ1-city:city/captured/reassign-workers',
    new Effect((capturedCity: City): void => {
      // `shrink` above destroys a size 1 `City`, which releases its tiles, and assigning any now would leave them held
      // by a `City` that no longer exists. Checked here rather than as a `Criterion`: every `Criterion` is evaluated
      // before any `Effect` runs, so one would still see the `City` as it was before `shrink`.
      if (capturedCity.destroyed()) {
        return;
      }

      reassignWorkers(
        capturedCity,
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry,
        specialistRegistry,
        availableSpecialistRegistry
      );
    })
  ),
];

export default getRules;
