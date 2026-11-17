import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import BuildingCancelled from '@civ-clone/core-city-build/Rules/BulidingCancelled';
import CityBuild, {
  CityBuildClearedReason,
} from '@civ-clone/core-city-build/CityBuild';
import Effect from '@civ-clone/core-rule/Effect';
import { autoBuildOnCancelled } from '@civ-clone/base-city-auto-build/lib/autoBuildRules';
import { autoBuildable } from '../../lib/autoBuild';
import { emitBuildingCancelled } from '@civ-clone/base-city-lifecycle/lib/events';

export const getRules: (
  ruleRegistry?: RuleRegistry,
  engine?: Engine
) => BuildingCancelled[] = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  engine: Engine = engineInstance
): BuildingCancelled[] => [
  // A city has stopped building something, however it was dropped: told with the item and why, so a client can show
  //  the build as it is now, even in the middle of its player's turn (civ-clone/web-renderer#978).
  new BuildingCancelled(
    'civ1-city:city/building-cancelled/emit',
    new Effect(
      (
        cityBuild: CityBuild,
        item: Buildable,
        reason: CityBuildClearedReason
      ): void => {
        emitBuildingCancelled(cityBuild, item, reason, engine);
      }
    )
  ),
  // `civ1-city:city/building-cancelled/auto`: a city on Auto whose build can no longer be built chooses again
  //  (civ-clone/web-renderer#194).
  autoBuildOnCancelled(
    { ruleRegistry },
    { include: autoBuildable, prefix: 'civ1-city' }
  ),
];

export default getRules;
