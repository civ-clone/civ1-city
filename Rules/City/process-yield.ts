import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { Food, Production } from '@civ-clone/base-terrain-civ1/Yields';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import Unit from '@civ-clone/core-unit/Unit';
import Yield from '@civ-clone/core-yield/Yield';

export const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  unitRegistry?: UnitRegistry
) => ProcessYield[] = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance
): ProcessYield[] => [
  new ProcessYield(
    new Criterion((cityYield: Yield): boolean => cityYield instanceof Food),
    new Effect((cityYield: Yield, city: City): void => {
      const cityGrowth = cityGrowthRegistry.getByCity(city);

      cityGrowth.add(cityYield);
      cityGrowth.check();
    })
  ),
  new ProcessYield(
    new Criterion(
      (cityYield: Yield): boolean => cityYield instanceof Production
    ),
    new Criterion((cityYield: Yield): boolean => cityYield.value() >= 0),
    new Effect((cityYield: Yield, city: City): void => {
      const cityBuild = cityBuildRegistry.getByCity(city);

      cityBuild.add(cityYield);
      cityBuild.check();
    })
  ),
  new ProcessYield(
    new Criterion(
      (cityYield: Yield): boolean => cityYield instanceof Production
    ),
    new Criterion((cityYield: Yield): boolean => cityYield.value() < 0),
    new Effect((cityYield: Yield, city: City): void =>
      unitRegistry
        .getByCity(city)
        .sort(
          (a: Unit, b: Unit): number =>
            a.tile().distanceFrom(city.tile()) -
            b.tile().distanceFrom(city.tile())
        )
        .slice(cityYield.value())
        .forEach((unit: Unit): void => unit.destroy())
    )
  ),
];

export default getRules;
