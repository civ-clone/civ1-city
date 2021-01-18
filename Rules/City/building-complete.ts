import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Effect from '@civ-clone/core-rule/Effect';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';

export const getRules: (engine?: Engine) => BuildingComplete[] = (
  engine: Engine = engineInstance
): BuildingComplete[] => [
  new BuildingComplete(
    new Effect((cityBuild: CityBuild, built: any): void => {
      engine.emit('city:building-complete', cityBuild, built);
    })
  ),
];

export default getRules;
