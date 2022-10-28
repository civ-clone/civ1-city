"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const Yield_1 = require("@civ-clone/core-city/Rules/Yield");
const getRules = () => [
    new Yield_1.default(new Priority_1.default(0), // X High
    new Effect_1.default((city) => city
        .tilesWorked()
        .entries()
        .flatMap((tile) => tile.yields(city.player()).flatMap((tileYield) => new tileYield.constructor(tileYield.value(), tile.id() +
        ': ' +
        tileYield
            .values()
            .map(([, provider]) => provider)
            .join('-')))))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map