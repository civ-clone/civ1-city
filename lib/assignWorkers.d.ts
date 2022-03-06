import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import City from '@civ-clone/core-city/City';
import Yield from '@civ-clone/core-yield/Yield';
export declare const getHighestValueCityTiles: (
  city: City,
  weights?: [typeof Yield, number][]
) => any[];
export declare const getHighestValueAvailableCityTiles: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry
) => any[];
export declare const reassignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => void;
export declare const assignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => void;
export default assignWorkers;
