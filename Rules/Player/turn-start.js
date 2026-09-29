"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const TileReassigned_1 = require("@civ-clone/core-city/Rules/TileReassigned");
const TurnStart_1 = require("@civ-clone/core-player/Rules/TurnStart");
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    new TurnStart_1.default('civ1-city:player/turn-start/release-occupied-worked-tiles', 
    // Before the `City` yields are processed (`civ1-player:player/turn-start/process-city-yields` is `High`).
    new Priority_1.default(0), // X High
    new Effect_1.default((player) => cityRegistry.getByPlayer(player).forEach((city) => workedTileRegistry
        .getByCity(city)
        .filter((workedTile) => workedTile.tile() !== city.tile() &&
        unitRegistry
            .getByTile(workedTile.tile())
            .some((unit) => unit.player() !== player))
        .forEach((workedTile) => {
        workedTileRegistry.unregister(workedTile);
        ruleRegistry.process(TileReassigned_1.default, city, workedTile.tile());
    })))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=turn-start.js.map