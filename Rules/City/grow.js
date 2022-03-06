"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Grow_1 = require("@civ-clone/core-city-growth/Rules/Grow");
const assignWorkers_1 = require("../../lib/assignWorkers");
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance) => [
    new Grow_1.default(new Effect_1.default((cityGrowth) => cityGrowth.empty())),
    new Grow_1.default(new Effect_1.default((cityGrowth) => cityGrowth.cost().set((cityGrowth.size() + 1) * 10, 'city-grow'))),
    new Grow_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.city().tilesWorked().length < cityGrowth.size() + 1), new Effect_1.default((cityGrowth) => (0, assignWorkers_1.default)(cityGrowth.city(), playerWorldRegistry, cityGrowthRegistry))),
    new Grow_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.city().tilesWorked().length > cityGrowth.size() + 1), new Effect_1.default((cityGrowth) => cityGrowth
        .city()
        .tilesWorked()
        .entries()
        .slice(cityGrowth.size() + 1)
        .forEach((tile) => cityGrowth.city().tilesWorked().unregister(tile)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=grow.js.map