import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import BuildingCancelled from '@civ-clone/core-city-build/Rules/BulidingCancelled';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Effect from '@civ-clone/core-rule/Effect';
import autoBuild from '../../lib/autoBuild';

export const getRules: (ruleRegistry?: RuleRegistry) => BuildingCancelled[] = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): BuildingCancelled[] => [
  new BuildingCancelled(
    // A city on Auto whose build can no longer be built chooses again (civ-clone/web-renderer#194).
    'civ1-city:city/building-cancelled/auto',
    new Effect((cityBuild: CityBuild): void => {
      autoBuild(cityBuild, ruleRegistry);
    })
  ),
];

export default getRules;
