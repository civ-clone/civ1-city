"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Shrink_1 = require("@civ-clone/core-city-growth/Rules/Shrink");
const assignWorkers_1 = require("../../lib/assignWorkers");
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance) => [
    new Shrink_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.size() > 0), new Effect_1.default((cityGrowth) => cityGrowth.cost().set((cityGrowth.size() + 1) * 10, 'city-shrink'))),
    new Shrink_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.size() > 0), new Criterion_1.default((cityGrowth) => cityGrowth.city().tilesWorked().length > cityGrowth.size() + 1), new Effect_1.default((cityGrowth) => cityGrowth
        .city()
        .tilesWorked()
        .entries()
        .slice(cityGrowth.size() + 1)
        .forEach((tile) => cityGrowth.city().tilesWorked().unregister(tile)))),
    new Shrink_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.size() > 0), new Criterion_1.default((cityGrowth) => cityGrowth.city().tilesWorked().length < cityGrowth.size() + 1), new Effect_1.default((cityGrowth) => (0, assignWorkers_1.default)(cityGrowth.city(), playerWorldRegistry, cityGrowthRegistry))),
    // TODO: this needs to potentially be associated to an attacking user...
    new Shrink_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.size() === 0), new Effect_1.default((cityGrowth) => cityGrowth.city().destroy())),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=shrink.js.map