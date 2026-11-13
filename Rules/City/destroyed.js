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
const Priorities_1 = require("@civ-clone/core-rule/Priorities");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Types_1 = require("@civ-clone/civ1-unit/Types");
const defendersLosing_1 = require("../../lib/defendersLosing");
const traits_1 = require("@civ-clone/core-unit/traits");
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
    // The ships and aircraft in the city go with it, wherever their home; units on land stay on its square
    //  (civ-clone/web-renderer#969). v474.05 `vanish` (`ECONOMY.C`), once it has disbanded the units the city supported:
    //
    //  ```c
    //  u = map_stack(x, y);
    //  if (u != -1)
    //      each_stack(townbuf[idx].owner, u, kill_stack_cb);
    //  ```
    //
    //  where `kill_stack_cb` (`UNITS.C`) disbands any unit that isn't a land unit:
    //  `if (utypes[armydata[group][index].type].domain != 0) drop_u_stack(group, index);`. `drop_u_stack` takes a
    //  ship's cargo with it only at sea (`terrain_at(...) == 10`), which a city's square never is, so the land units
    //  aboard stay in the city, as `civ1-unit`'s `unit/destroyed/lose-cargo` leaves them; an aircraft aboard a Carrier
    //  goes, as an aircraft. Lost to no one, as the city's own units are: v474.05 counts a loss in `drop_u_stack` only
    //  while `see_fight_all` is set, and `CONTROL.C` clears it after a battle, before the city that lost it vanishes.
    //  Only the city's player can have units on its square as it goes: a city is conquered only once nothing defends it,
    //  and one incited to revolt is never destroyed (`city/captured/shrink`).
    //
    //  Low, so after every other player's `Destroyed` rule whichever package loads first: when the city was its player's
    //  last, `civ1-player`'s `city/destroyed/defeat-when-last-city` defeats the player first, which destroys all its
    //  units, these among them, once each; destroying one here first would defeat the player from inside its own
    //  destruction (`civ1-player`'s `unit/destroyed/defeat-when-no-cities`), and it would be destroyed, and announced,
    //  twice.
    new Destroyed_1.default('civ1-city:city/destroyed/destroy-ships-and-aircraft', new Priorities_1.Low(), new Effect_1.default((city) => unitRegistry
        .getByTile(city.tile())
        .filter((unit) => !(0, traits_1.isA)(unit, Types_1.Land))
        .forEach((unit) => {
        // Not a defender whose defeat destroyed the city, which is lost to the attacker (`lib/defendersLosing`).
        //  Those that went with the city already, as it supported them, or with its player, are no longer on the
        //  square.
        if (defendersLosing_1.default.has(unit)) {
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