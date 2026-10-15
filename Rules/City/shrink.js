"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Shrink_1 = require("@civ-clone/core-city-growth/Rules/Shrink");
const SpecialistRegistry_1 = require("@civ-clone/core-city/SpecialistRegistry");
const assignWorkers_1 = require("../../lib/assignWorkers");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, engine = Engine_1.instance) => [
    new Shrink_1.default('civ1-city:city/shrink/set-growth-cost', new Criterion_1.default((cityGrowth) => cityGrowth.size() > 0), new Effect_1.default((cityGrowth) => cityGrowth.cost().set((cityGrowth.size() + 1) * 10, 'city-shrink'))),
    new Shrink_1.default('civ1-city:city/shrink/reduce-workers', new Criterion_1.default((cityGrowth) => cityGrowth.size() > 0), new Criterion_1.default((cityGrowth) => (0, assignWorkers_1.citizenCount)(cityGrowth.city(), workedTileRegistry, specialistRegistry) >
        cityGrowth.size() + 1), new Effect_1.default((cityGrowth) => (0, assignWorkers_1.releaseCitizens)(cityGrowth.city(), cityGrowth, workedTileRegistry, specialistRegistry))),
    // A city shrunk to nothing is destroyed instead, which emits `city:destroyed` (civ-clone/web-renderer#400).
    new Shrink_1.default('civ1-city:city/shrink/emit', new Criterion_1.default((cityGrowth) => cityGrowth.size() > 0), new Effect_1.default((cityGrowth) => {
        engine.emit('city:shrink', cityGrowth.city());
    })),
    // TODO: this needs to potentially be associated to an attacking user...
    new Shrink_1.default('civ1-city:city/shrink/destroy-empty-city', new Criterion_1.default((cityGrowth) => cityGrowth.size() <= 0), new Effect_1.default((cityGrowth) => cityGrowth.city().destroy())),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=shrink.js.map