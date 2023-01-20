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
    new Effect((capturedCity: City): void =>
      cityBuildRegistry.getByCity(capturedCity).progress().set(0)
    )
  ),
  new Captured(
    new Effect((capturedCity: City): void =>
      cityGrowthRegistry.getByCity(capturedCity).shrink()
    )
  ),
  new Captured(
    new Effect(
      (capturedCity: City, capturingPlayer: Player, player: Player): void => {
        engine.emit('city:captured', capturedCity, capturingPlayer, player);
      }
    )
  ),
  new Captured(
    new Effect((capturedCity: City): void =>
      unitRegistry
        .getByCity(capturedCity)
        .forEach((unit: Unit) => unit.destroy())
    )
  ),
  new Captured(
    new Effect((capturedCity: City): void =>
      reassignWorkers(
        capturedCity,
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry
      )
    )
  ),
];

export default getRules;
