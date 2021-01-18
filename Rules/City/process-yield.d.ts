import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
export declare const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  unitRegistry?: UnitRegistry
) => ProcessYield[];
export default getRules;
