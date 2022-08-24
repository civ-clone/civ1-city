import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
export declare const getRules: (
  cityRegistry?: CityRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  engine?: Engine
) => Defeated[];
export default getRules;
