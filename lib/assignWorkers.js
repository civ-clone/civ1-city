"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignWorkers = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const Yields_1 = require("@civ-clone/civ1-world/Yields");
const assignWorkers = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) => {
    const cityGrowth = cityGrowthRegistry.getByCity(city);
    city.tilesWorked().register(...city
        .tile()
        .getSurroundingArea()
        .filter((tile) => !city.tilesWorked().includes(tile))
        .filter((tile) => playerWorldRegistry.getByPlayer(city.player()).includes(tile))
        .sort((a, b) => b.score(city.player(), [
        [Yields_1.Food, 4],
        [Yields_1.Production, 2],
        [Yields_1.Trade, 1],
    ]) -
        a.score(city.player(), [
            [Yields_1.Food, 4],
            [Yields_1.Production, 2],
            [Yields_1.Trade, 1],
        ]))
        // +1 here because we also work the main city tile
        .slice(0, cityGrowth.size() + 1 - city.tilesWorked().length));
};
exports.assignWorkers = assignWorkers;
exports.default = exports.assignWorkers;
//# sourceMappingURL=assignWorkers.js.map