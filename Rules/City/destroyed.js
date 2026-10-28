"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const TradeRouteRegistry_1 = require("@civ-clone/core-city/TradeRouteRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Destroyed_1 = require("@civ-clone/core-city/Rules/Destroyed");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Removed_1 = require("@civ-clone/core-tile-improvement/Rules/Removed");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const SpecialistRegistry_1 = require("@civ-clone/core-city/SpecialistRegistry");
const getRules = (tileImprovementRegistry = TileImprovementRegistry_1.instance, cityRegistry = CityRegistry_1.instance, engine = Engine_1.instance, unitRegistry = UnitRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, tradeRouteRegistry = TradeRouteRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    // Through the `Removed` rules, as clearing pollution does, so the square's yields are worked out again and
    //  `tile-improvement:removed` is raised for whoever shows the square (civ-clone/web-renderer#401).
    new Destroyed_1.default('civ1-city:city/destroyed/remove-irrigation', new Effect_1.default((city) => tileImprovementRegistry
        .getByTile(city.tile())
        .filter((improvement) => improvement instanceof TileImprovements_1.Irrigation)
        .forEach((irrigation) => {
        ruleRegistry.process(Removed_1.default, city.tile(), irrigation);
    }))),
    new Destroyed_1.default('civ1-city:city/destroyed/emit', new Effect_1.default((city, player) => {
        engine.emit('city:destroyed', city, player);
    })),
    new Destroyed_1.default('civ1-city:city/destroyed/destroy-supported-units', new Effect_1.default((city) => unitRegistry.getByCity(city).forEach((unit) => {
        // Not one the disbanding of another took with it already: when the city was its player's last, the first unit
        //  to go defeats the player, which destroys the rest (civ-clone/web-renderer#600).
        if (unit.destroyed()) {
            return;
        }
        unit.destroy();
    }))),
    new Destroyed_1.default('civ1-city:city/destroyed/release-worked-tiles', new Effect_1.default((city) => workedTileRegistry
        .getByCity(city)
        .forEach((workedTile) => workedTileRegistry.unregister(workedTile)))),
    new Destroyed_1.default('civ1-city:city/destroyed/release-specialists', new Effect_1.default((city) => specialistRegistry
        .getByCity(city)
        .forEach((specialist) => specialistRegistry.unregister(specialist)))),
    // A destroyed city is cleared from every route, both the ones it held and the ones held to it (v474.05
    //  `Segment_1ade.cs` `F0_1ade_018e`, civ-clone/web-renderer#57).
    new Destroyed_1.default('civ1-city:city/destroyed/remove-trade-routes', new Effect_1.default((city) => tradeRouteRegistry.unregister(...tradeRouteRegistry.getByCity(city), ...tradeRouteRegistry.getByPartner(city)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=destroyed.js.map