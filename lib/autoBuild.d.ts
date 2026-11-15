import { AutoBuildInclude } from '@civ-clone/base-city-auto-build/lib/autoBuild';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
export declare const autoBuildable: AutoBuildInclude;
export declare const autoBuild: (
  cityBuild: CityBuild,
  ruleRegistry: RuleRegistry
) => boolean;
export default autoBuild;
