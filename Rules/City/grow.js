"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const AvailableSpecialistRegistry_1 = require("@civ-clone/core-city/AvailableSpecialistRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const SpecialistRegistry_1 = require("@civ-clone/core-city/SpecialistRegistry");
const assignWorkers_1 = require("../../lib/assignWorkers");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Grow_1 = require("@civ-clone/core-city-growth/Rules/Grow");
// From a city's 21st citizen, new citizens are born as Entertainers: p240, Wilson, J.L & Emrich A. (1992). Sid Meier's
// Civilization, or Rome on 640K a Day. Rocklin, CA: Prima Publishing
const largestWorkingSize = 20;
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance) => [
    new Grow_1.default('civ1-city:city/grow/empty-food-store', new Effect_1.default((cityGrowth) => cityGrowth.empty())),
    new Grow_1.default('civ1-city:city/grow/set-growth-cost', new Effect_1.default((cityGrowth) => cityGrowth.cost().set((cityGrowth.size() + 1) * 10, 'city-grow'))),
    new Grow_1.default('civ1-city:city/grow/assign-worker', new Criterion_1.default((cityGrowth) => cityGrowth.size() <= largestWorkingSize), new Criterion_1.default((cityGrowth) => (0, assignWorkers_1.citizenCount)(cityGrowth.city(), workedTileRegistry, specialistRegistry) <
        cityGrowth.size() + 1), new Effect_1.default((cityGrowth) => (0, assignWorkers_1.assignWorker)(cityGrowth.city(), playerWorldRegistry, cityGrowthRegistry, workedTileRegistry, specialistRegistry, availableSpecialistRegistry))),
    new Grow_1.default('civ1-city:city/grow/born-entertainer', new Criterion_1.default((cityGrowth) => cityGrowth.size() > largestWorkingSize), new Criterion_1.default((cityGrowth) => (0, assignWorkers_1.citizenCount)(cityGrowth.city(), workedTileRegistry, specialistRegistry) <
        cityGrowth.size() + 1), new Effect_1.default((cityGrowth) => {
        (0, assignWorkers_1.addSpecialist)(cityGrowth.city(), specialistRegistry, availableSpecialistRegistry);
    })),
    new Grow_1.default('civ1-city:city/grow/reduce-workers', new Criterion_1.default((cityGrowth) => (0, assignWorkers_1.citizenCount)(cityGrowth.city(), workedTileRegistry, specialistRegistry) >
        cityGrowth.size() + 1), new Effect_1.default((cityGrowth) => (0, assignWorkers_1.releaseCitizens)(cityGrowth.city(), cityGrowth, workedTileRegistry, specialistRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=grow.js.map