import {
  fatCross,
  fatCrossRadius,
} from '@civ-clone/base-city-tiles-fat-cross/lib/fatCross';
import { rings, ringsCount } from '@civ-clone/base-city-tiles-rings/lib/rings';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import { ITopology } from '@civ-clone/core-world/Topology';
import Tiles from '@civ-clone/core-city/Rules/Tiles';
import Tileset from '@civ-clone/core-world/Tileset';

/**
 * Whether the grid has the square grid's axes, which the fat cross is cut in.
 * A hexagonal grid has six neighbours, not eight, and no such axes (its
 * `logicalDelta` is `null`, as `civ1Distance` reads it too).
 */
const hasSquareAxes = (topology: ITopology): boolean =>
  typeof topology.logicalDelta !== 'function' ||
  topology.logicalDelta(0, 0, 0, 0) !== null;

/**
 * A city works the tiles within 2.5 of it by the world's own distance: on the
 * square grid, the 21-tile "fat cross" (base-city-tiles-fat-cross). On the
 * hexagonal grid, which has no fat cross, the 2 rings round it: the 19-tile hex
 * (base-city-tiles-rings).
 */
export const getRules = (): Tiles[] => [
  new Tiles(
    'civ1-city:city/tiles/fat-cross',
    new Effect((city: City): Tileset => {
      const tile = city.tile();

      return hasSquareAxes(tile.map().topology())
        ? fatCross(tile, fatCrossRadius)
        : rings(tile, ringsCount);
    })
  ),
];

export default getRules;
