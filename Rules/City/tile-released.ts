import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Tile from '@civ-clone/core-world/Tile';
import TileReleased from '@civ-clone/core-city/Rules/TileReleased';

export const getRules: (engine?: Engine) => TileReleased[] = (
  engine: Engine = engineInstance
): TileReleased[] => [
  // A client redraws the tile, which no longer shows the city working it (civ-clone/web-renderer#138).
  new TileReleased(
    'civ1-city:city/tile-released/emit',
    new Effect((city: City, tile: Tile): void => {
      engine.emit('city:tile-released', city, tile);
    })
  ),
];

export default getRules;
