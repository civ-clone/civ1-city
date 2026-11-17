"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const fatCross_1 = require("@civ-clone/base-city-tiles-fat-cross/lib/fatCross");
const rings_1 = require("@civ-clone/base-city-tiles-rings/lib/rings");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Tiles_1 = require("@civ-clone/core-city/Rules/Tiles");
/**
 * Whether the grid has the square grid's axes, which the fat cross is cut in.
 * A hexagonal grid has six neighbours, not eight, and no such axes (its
 * `logicalDelta` is `null`, as `civ1Distance` reads it too).
 */
const hasSquareAxes = (topology) => typeof topology.logicalDelta !== 'function' ||
    topology.logicalDelta(0, 0, 0, 0) !== null;
/**
 * A city works the tiles within 2.5 of it by the world's own distance: on the
 * square grid, the 21-tile "fat cross" (base-city-tiles-fat-cross). On the
 * hexagonal grid, which has no fat cross, the 2 rings round it: the 19-tile hex
 * (base-city-tiles-rings).
 */
const getRules = () => [
    new Tiles_1.default('civ1-city:city/tiles/fat-cross', new Effect_1.default((city) => {
        const tile = city.tile();
        return hasSquareAxes(tile.map().topology())
            ? (0, fatCross_1.fatCross)(tile, fatCross_1.fatCrossRadius)
            : (0, rings_1.rings)(tile, rings_1.ringsCount);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=tiles.js.map