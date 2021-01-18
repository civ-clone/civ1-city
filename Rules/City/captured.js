"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, engine = Engine_1.instance) => [
    new Captured_1.default(new Effect_1.default((capturedCity) => cityBuildRegistry.getByCity(capturedCity).progress().set(0))),
    new Captured_1.default(new Effect_1.default((capturedCity) => cityGrowthRegistry.getByCity(capturedCity).shrink())),
    new Captured_1.default(new Effect_1.default((capturedCity, player) => {
        engine.emit('city:captured', capturedCity, player);
    })),
    new Captured_1.default(new Effect_1.default((capturedCity) => unitRegistry
        .getByCity(capturedCity)
        .forEach((unit) => unit.destroy()))),
    new Captured_1.default(
    // TODO: have some `Rule`s that just call `Player#defeated` or something?
    new Criterion_1.default((capturedCity) => cityRegistry.getByPlayer(capturedCity.player()).length === 0), new Effect_1.default((capturedCity) => {
        engine.emit('player:defeated', capturedCity.player());
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map