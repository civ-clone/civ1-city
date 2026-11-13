"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const canBeWorked_1 = require("@civ-clone/base-city-lifecycle/lib/canBeWorked");
const CanBeWorked_1 = require("@civ-clone/core-city/Rules/CanBeWorked");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => [
    new CanBeWorked_1.default('civ1-city:city/can-be-worked/not-already-worked', new Effect_1.default((tile) => (0, canBeWorked_1.isNotWorked)(tile, workedTileRegistry))),
    new CanBeWorked_1.default('civ1-city:city/can-be-worked/not-occupied-by-enemy', new Effect_1.default((tile, city) => (0, canBeWorked_1.isNotOccupiedByEnemy)(tile, city, unitRegistry))),
    new CanBeWorked_1.default('civ1-city:city/can-be-worked/not-another-city', new Effect_1.default((tile, city) => (0, canBeWorked_1.isNotAnotherCity)(tile, city, cityRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=can-be-worked.js.map