import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import City from '@civ-clone/core-city/City';
export declare const assignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => void;
export default assignWorkers;
