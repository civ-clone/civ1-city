import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import { Attack } from '@civ-clone/civ1-unit/Actions';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';

export const getRules: (
  cityRegistry?: CityRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  engine?: Engine
) => Defeated[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  engine: Engine = engineInstance
): Defeated[] => [
  new Defeated(
    new Criterion(
      (defeated, by, action) =>
        action instanceof Attack &&
        action.to() === defeated.tile() &&
        cityRegistry.getByTile(action.to()).length > 0
    ),
    new Effect((defeated) => {
      const [city] = cityRegistry.getByTile(defeated.tile()),
        cityGrowth = cityGrowthRegistry.getByCity(city);

      cityGrowth.shrink();
    })
  ),
  new Defeated(
    new Effect((defeated, by, action) =>
      engine.emit('unit:defeated', defeated, by, action)
    )
  ),
];

export default getRules;
