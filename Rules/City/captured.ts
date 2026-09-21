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
  workedTileRegistry?: WorkedTileRegistry
) => Captured[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  engine: Engine = engineInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): Captured[] => [
  new Captured(
    'civ1-city:city/captured/reset-build-progress',
    new Effect((capturedCity: City): void =>
      cityBuildRegistry.getByCity(capturedCity).progress().set(0)
    )
  ),
  new Captured(
    'civ1-city:city/captured/shrink',
    new Effect((capturedCity: City): void =>
      cityGrowthRegistry.getByCity(capturedCity).shrink()
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
    new Effect((capturedCity: City): void =>
      unitRegistry
        .getByCity(capturedCity)
        .forEach((unit: Unit) => unit.destroy())
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
        workedTileRegistry
      );
    })
  ),
];

export default getRules;
