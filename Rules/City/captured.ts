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
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
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
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => Captured[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  engine: Engine = engineInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
): Captured[] => [
  new Captured(
    'civ1-city:city/captured/reset-build-progress',
    new Effect((capturedCity: City): void =>
      cityBuildRegistry.getByCity(capturedCity).progress().set(0)
    )
  ),
  new Captured(
    // Auto is the previous owner's standing order, not the city's (civ-clone/web-renderer#194).
    'civ1-city:city/captured/stop-auto',
    new Effect((capturedCity: City): void =>
      cityBuildRegistry.getByCity(capturedCity).setAuto(false)
    )
  ),
  new Captured(
    // What it was building was its previous owner's choice, at its previous owner's price: one its new owner may not
    //  be able to build, or want (civ-clone/web-renderer#670, #500). The new owner chooses. Civ1 keeps the item; this
    //  is a deliberate change. After `stop-auto`, so the `BuildingCancelled` rules don't choose for the city.
    'civ1-city:city/captured/clear-build',
    new Effect((capturedCity: City): void =>
      cityBuildRegistry.getByCity(capturedCity).cancel()
    )
  ),
  new Captured(
    'civ1-city:city/captured/shrink',
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
