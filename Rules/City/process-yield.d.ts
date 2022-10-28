import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
export declare const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  unitRegistry?: UnitRegistry,
  ruleRegistry?: RuleRegistry
) => ProcessYield[];
export default getRules;
