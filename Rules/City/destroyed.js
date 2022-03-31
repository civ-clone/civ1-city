"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Destroyed_1 = require("@civ-clone/core-city/Rules/Destroyed");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const getRules = (tileImprovementRegistry = TileImprovementRegistry_1.instance, cityRegistry = CityRegistry_1.instance, engine = Engine_1.instance, unitRegistry = UnitRegistry_1.instance) => [
    new Destroyed_1.default(new Effect_1.default((city) => tileImprovementRegistry
        .getByTile(city.tile())
        .filter((improvement) => improvement instanceof TileImprovements_1.Irrigation)
        .forEach((irrigation) => tileImprovementRegistry.unregister(irrigation)))),
    new Destroyed_1.default(new Effect_1.default((city) => cityRegistry.unregister(city))),
    new Destroyed_1.default(new Effect_1.default((city, player) => {
        engine.emit('city:destroyed', city, player);
    })),
    new Destroyed_1.default(new Effect_1.default((city) => unitRegistry.getByCity(city).forEach((unit) => unit.destroy()))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=destroyed.js.map