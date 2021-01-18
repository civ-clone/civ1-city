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
import City from '@civ-clone/core-city/City';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import { Irrigation } from '@civ-clone/base-terrain-civ1/TileImprovements';
import Player from '@civ-clone/core-player/Player';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';

export const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  cityRegistry?: CityRegistry,
  engine?: Engine
) => Destroyed[] = (
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  engine: Engine = engineInstance
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
    new Effect((city: City): void => cityRegistry.unregister(city))
  ),
  new Destroyed(
    new Effect((city: City, player: Player | null): void => {
      engine.emit('city:destroyed', city, player);
    })
  ),
];

export default getRules;
