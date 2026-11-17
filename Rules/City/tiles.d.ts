import Tiles from '@civ-clone/core-city/Rules/Tiles';
/**
 * A city works the tiles within 2.5 of it by the world's own distance: on the
 * square grid, the 21-tile "fat cross" (base-city-tiles-fat-cross). On the
 * hexagonal grid, which has no fat cross, the 2 rings round it: the 19-tile hex
 * (base-city-tiles-rings).
 */
export declare const getRules: () => Tiles[];
export default getRules;
