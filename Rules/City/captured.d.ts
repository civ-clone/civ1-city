import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import Captured from '@civ-clone/core-city/Rules/Captured';
export declare const getRules: (
  cityRegistry?: CityRegistry,
  unitRegistry?: UnitRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  engine?: Engine
) => Captured[];
export default getRules;
