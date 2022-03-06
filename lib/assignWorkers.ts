import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { Food, Production, Trade } from '@civ-clone/civ1-world/Yields';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Yield from '@civ-clone/core-yield/Yield';

export const getHighestValueCityTiles = (
  city: City,
  weights: [typeof Yield, number][] = [
    [Food, 4],
    [Production, 2],
    [Trade, 1],
  ]
) =>
  city
    .tiles()
    .entries()
    .sort(
      (a: Tile, b: Tile) =>
        b.score(city.player(), weights) - a.score(city.player(), weights)
    );

export const getHighestValueAvailableCityTiles = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance
) =>
  getHighestValueCityTiles(city).filter(
    (tile) =>
      playerWorldRegistry.getByPlayer(city.player()).includes(tile) &&
      !city.tilesWorked().includes(tile) &&
      city.tile() !== tile
  );

export const reassignWorkers = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
) => {
  city.tilesWorked().unregister(...city.tilesWorked().entries());

  city.tilesWorked().register(city.tile());

  assignWorkers(city, playerWorldRegistry, cityGrowthRegistry);
};

export const assignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => void = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): void => {
  const cityGrowth = cityGrowthRegistry.getByCity(city);

  getHighestValueAvailableCityTiles(city, playerWorldRegistry).some((tile) => {
    if (city.tilesWorked().length >= cityGrowth.size() + 1) {
      return true;
    }

    city.tilesWorked().register(tile);

    return false;
  });
};

export default assignWorkers;
