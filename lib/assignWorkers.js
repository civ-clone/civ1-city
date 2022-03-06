"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignWorkers = exports.reassignWorkers = exports.getHighestValueAvailableCityTiles = exports.getHighestValueCityTiles = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Yields_1 = require("@civ-clone/civ1-world/Yields");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const getHighestValueCityTiles = (city, weights = [
    [Yields_1.Food, 4],
    [Yields_1.Production, 2],
    [Yields_1.Trade, 1],
]) => city
    .tiles()
    .entries()
    .sort((a, b) => b.score(city.player(), weights) - a.score(city.player(), weights));
exports.getHighestValueCityTiles = getHighestValueCityTiles;
const getHighestValueAvailableCityTiles = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance) => (0, exports.getHighestValueCityTiles)(city).filter((tile) => playerWorldRegistry.getByPlayer(city.player()).includes(tile) &&
    !city.tilesWorked().includes(tile) &&
    city.tile() !== tile);
exports.getHighestValueAvailableCityTiles = getHighestValueAvailableCityTiles;
const reassignWorkers = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) => {
    city.tilesWorked().unregister(...city.tilesWorked().entries());
    city.tilesWorked().register(city.tile());
    (0, exports.assignWorkers)(city, playerWorldRegistry, cityGrowthRegistry);
};
exports.reassignWorkers = reassignWorkers;
const assignWorkers = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) => {
    const cityGrowth = cityGrowthRegistry.getByCity(city);
    (0, exports.getHighestValueAvailableCityTiles)(city, playerWorldRegistry).some((tile) => {
        if (city.tilesWorked().length >= cityGrowth.size() + 1) {
            return true;
        }
        city.tilesWorked().register(tile);
        return false;
    });
};
exports.assignWorkers = assignWorkers;
exports.default = exports.assignWorkers;
//# sourceMappingURL=assignWorkers.js.map