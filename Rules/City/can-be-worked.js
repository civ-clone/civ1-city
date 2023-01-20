"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const CanBeWorked_1 = require("@civ-clone/core-city/Rules/CanBeWorked");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => [
    new CanBeWorked_1.default(new Effect_1.default((tile) => !workedTileRegistry.tileIsWorked(tile))),
    new CanBeWorked_1.default(new Effect_1.default((tile, city) => !unitRegistry
        .getByTile(tile)
        .some((unit) => unit.player() !== city.player()))),
    new CanBeWorked_1.default(new Effect_1.default((tile, city) => {
        const otherTileCity = cityRegistry.getByTile(tile);
        if (otherTileCity === null) {
            return true;
        }
        return otherTileCity === city;
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=can-be-worked.js.map