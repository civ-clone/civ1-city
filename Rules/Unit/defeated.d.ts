import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
export declare const getRules: (
  cityRegistry?: CityRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => Defeated[];
export default getRules;
