import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Effect from '@civ-clone/core-rule/Effect';
import autoBuild from '../../lib/autoBuild';

export const getRules: (
  engine?: Engine,
  ruleRegistry?: RuleRegistry
) => BuildingComplete[] = (
  engine: Engine = engineInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): BuildingComplete[] => [
  new BuildingComplete(
    'civ1-city:city/building-complete/emit',
    new Effect((cityBuild: CityBuild, built: any): void => {
      engine.emit('city:building-complete', cityBuild, built);
    })
  ),
  new BuildingComplete(
    // A city on Auto goes straight on to what it needs next (civ-clone/web-renderer#194).
    'civ1-city:city/building-complete/auto',
    new Effect((cityBuild: CityBuild): void => {
      autoBuild(cityBuild, ruleRegistry);
    })
  ),
];

export default getRules;
