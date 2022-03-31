import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';

export const getRules: (
  cityRegistry?: CityRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => Defeated[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): Defeated[] => [
  new Defeated(
    new Criterion((unit) => cityRegistry.getByTile(unit.tile()).length > 0),
    new Effect((unit) => {
      const [city] = cityRegistry.getByTile(unit.tile()),
        cityGrowth = cityGrowthRegistry.getByCity(city);

      cityGrowth.shrink();
    })
  ),
];

export default getRules;
