import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Tile from '@civ-clone/core-world/Tile';
import TileWorked from '@civ-clone/core-city/Rules/TileWorked';

export const getRules: (engine?: Engine) => TileWorked[] = (
  engine: Engine = engineInstance
): TileWorked[] => [
  // A client redraws the tile, which shows who works it (civ-clone/web-renderer#138).
  new TileWorked(
    'civ1-city:city/tile-worked/emit',
    new Effect((city: City, tile: Tile): void => {
      engine.emit('city:tile-worked', city, tile);
    })
  ),
];

export default getRules;
