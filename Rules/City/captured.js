"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const assignWorkers_1 = require("../../lib/assignWorkers");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, engine = Engine_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => [
    new Captured_1.default(new Effect_1.default((capturedCity) => cityBuildRegistry.getByCity(capturedCity).progress().set(0))),
    new Captured_1.default(new Effect_1.default((capturedCity) => cityGrowthRegistry.getByCity(capturedCity).shrink())),
    new Captured_1.default(new Effect_1.default((capturedCity, capturingPlayer, player) => {
        engine.emit('city:captured', capturedCity, capturingPlayer, player);
    })),
    new Captured_1.default(new Effect_1.default((capturedCity) => unitRegistry
        .getByCity(capturedCity)
        .forEach((unit) => unit.destroy()))),
    new Captured_1.default(new Effect_1.default((capturedCity) => (0, assignWorkers_1.reassignWorkers)(capturedCity, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map