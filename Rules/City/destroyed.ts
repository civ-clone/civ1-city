import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import { Irrigation } from '@civ-clone/civ1-world/TileImprovements';
import Player from '@civ-clone/core-player/Player';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import {
  instance as workedTileRegistryInstance,
  WorkedTileRegistry,
} from '@civ-clone/core-city/WorkedTileRegistry';

export const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  cityRegistry?: CityRegistry,
  engine?: Engine,
  unitRegistry?: UnitRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => Destroyed[] = (
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  engine: Engine = engineInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): Destroyed[] => [
  new Destroyed(
    new Effect((city: City): void =>
      tileImprovementRegistry
        .getByTile(city.tile())
        .filter(
          (improvement: TileImprovement): boolean =>
            improvement instanceof Irrigation
        )
        .forEach((irrigation: TileImprovement): void =>
          tileImprovementRegistry.unregister(irrigation)
        )
    )
  ),

  new Destroyed(
    new Effect((city: City, player: Player | null): void => {
      engine.emit('city:destroyed', city, player);
    })
  ),

  new Destroyed(
    new Effect((city: City): void =>
      unitRegistry.getByCity(city).forEach((unit: Unit) => unit.destroy())
    )
  ),

  new Destroyed(
    new Effect((city: City): void =>
      workedTileRegistry
        .getByCity(city)
        .forEach((workedTile) => workedTileRegistry.unregister(workedTile))
    )
  ),
];

export default getRules;
