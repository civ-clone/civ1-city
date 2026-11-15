import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import BuildingCancelled from '@civ-clone/core-city-build/Rules/BulidingCancelled';
import { autoBuildOnCancelled } from '@civ-clone/base-city-auto-build/lib/autoBuildRules';
import { autoBuildable } from '../../lib/autoBuild';

export const getRules: (ruleRegistry?: RuleRegistry) => BuildingCancelled[] = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): BuildingCancelled[] => [
  // `civ1-city:city/building-cancelled/auto`: a city on Auto whose build can no longer be built chooses again
  //  (civ-clone/web-renderer#194).
  autoBuildOnCancelled(
    { ruleRegistry },
    { include: autoBuildable, prefix: 'civ1-city' }
  ),
];

export default getRules;
