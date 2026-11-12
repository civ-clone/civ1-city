import {
  fatCross,
  fatCrossRadius,
} from '@civ-clone/base-city-tiles-fat-cross/lib/fatCross';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Tiles from '@civ-clone/core-city/Rules/Tiles';
import Tileset from '@civ-clone/core-world/Tileset';

/**
 * A city works the tiles within 2.5 of it by the world's own distance: on the
 * square grid, the 21-tile "fat cross" (base-city-tiles-fat-cross).
 */
export const getRules = (): Tiles[] => [
  new Tiles(
    'civ1-city:city/tiles/fat-cross',
    new Effect((city: City): Tileset => fatCross(city.tile(), fatCrossRadius))
  ),
];

export default getRules;
