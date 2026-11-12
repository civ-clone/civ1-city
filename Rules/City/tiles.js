"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const fatCross_1 = require("@civ-clone/base-city-tiles-fat-cross/lib/fatCross");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Tiles_1 = require("@civ-clone/core-city/Rules/Tiles");
/**
 * A city works the tiles within 2.5 of it by the world's own distance: on the
 * square grid, the 21-tile "fat cross" (base-city-tiles-fat-cross).
 */
const getRules = () => [
    new Tiles_1.default('civ1-city:city/tiles/fat-cross', new Effect_1.default((city) => (0, fatCross_1.fatCross)(city.tile(), fatCross_1.fatCrossRadius))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=tiles.js.map