import BuildItem from '@civ-clone/core-city-build/BuildItem';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
export declare const autoBuildable: (buildItem: BuildItem) => boolean;
export declare const autoBuild: (
  cityBuild: CityBuild,
  ruleRegistry: RuleRegistry
) => boolean;
export default autoBuild;
