import { Engine } from '@civ-clone/core-engine/Engine';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
export declare const getRules: (
  engine?: Engine,
  ruleRegistry?: RuleRegistry
) => BuildingComplete[];
export default getRules;
