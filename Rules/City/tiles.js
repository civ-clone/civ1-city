"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Tiles_1 = require("@civ-clone/core-city/Rules/Tiles");
const Tileset_1 = require("@civ-clone/core-world/Tileset");
const getRules = () => [
    new Tiles_1.default(new Effect_1.default((city) => Tileset_1.default.from(...city
        .tile()
        .getSurroundingArea(2)
        .filter((tile, i) => ![0, 4, 20, 24].includes(i))))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=tiles.js.map