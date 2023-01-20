"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TileReassigned_1 = require("@civ-clone/core-city/Rules/TileReassigned");
const assignWorkers_1 = require("../../lib/assignWorkers");
const getRules = (playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => [
    new TileReassigned_1.default(new Effect_1.default((city) => (0, assignWorkers_1.default)(city, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=tile-reassigned.js.map