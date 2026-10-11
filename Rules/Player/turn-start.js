"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const TileReassigned_1 = require("@civ-clone/core-city/Rules/TileReassigned");
const TurnStart_1 = require("@civ-clone/core-player/Rules/TurnStart");
const autoBuild_1 = require("../../lib/autoBuild");
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance) => [
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
    new TurnStart_1.default(
    // A city on Auto that had nothing it would choose, such as one whose player knew nothing that unlocks an
    //  improvement, tries again each turn, once production has finished what it could (civ-clone/web-renderer#194).
    'civ1-city:player/turn-start/auto-build', new Effect_1.default((player) => cityRegistry.getByPlayer(player).forEach((city) => {
        (0, autoBuild_1.default)(cityBuildRegistry.getByCity(city), ruleRegistry);
    }))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=turn-start.js.map