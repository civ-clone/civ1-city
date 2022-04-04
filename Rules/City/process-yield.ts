import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CivilDisorder,
  ICivilDisorderRegistry,
} from '@civ-clone/core-city-happiness/Rules/CivilDisorder';
import { Food, Production } from '@civ-clone/civ1-world/Yields';
import {
  FoodStorage,
  PopulationSupportFood,
  UnitSupportFood,
  UnitSupportProduction,
} from '../../Yields';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
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
import Low from '@civ-clone/core-rule/Priorities/Low';

export const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  unitRegistry?: UnitRegistry,
  ruleRegistry?: RuleRegistry
) => ProcessYield[] = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): ProcessYield[] => [
  new ProcessYield(
    new Criterion((cityYield: Yield): boolean => cityYield instanceof Food),
    new Effect((cityYield: Yield, city: City, cityYields: Yield[]): void => {
      const cityGrowth = cityGrowthRegistry.getByCity(city),
        foodStorage = new FoodStorage(cityYield),
        foodSupportedUnits: UnitSupportFood[] = [];

      cityYields.forEach((cityYield) => {
        if (cityYield instanceof UnitSupportFood) {
          foodStorage.subtract(cityYield as Yield);

          foodSupportedUnits.push(cityYield);
        }

        if (cityYield instanceof PopulationSupportFood) {
          foodStorage.subtract(cityYield as Yield);
        }
      });

      // This should probably be its own `Rule`
      while (foodStorage.value() < 0 && foodSupportedUnits.length > 0) {
        const foodSupportedUnit = foodSupportedUnits.shift() as UnitSupportFood,
          unit = foodSupportedUnit.unit();

        // TODO: trigger a notification `UnsupportedUnit` - do the same for UnitSupportProduction.
        unit.destroy();

        foodStorage.add(foodSupportedUnit.value());
      }

      cityGrowth.add(foodStorage);
      cityGrowth.check();
    })
  ),

  new ProcessYield(
    new Criterion(
      (cityYield: Yield): boolean => cityYield instanceof Production
    ),
    new Effect((cityYield: Yield, city: City, cityYields: Yield[]): void =>
      cityYields.forEach((otherYield) => {
        if (otherYield instanceof UnitSupportProduction) {
          cityYield.subtract(otherYield as Yield);
        }
      })
    )
  ),

  new ProcessYield(
    new Low(),
    new Criterion(
      (cityYield: Yield): boolean => cityYield instanceof Production
    ),
    new Criterion(
      (cityYield: Yield, city: City, yields: Yield[]) =>
        !(ruleRegistry as ICivilDisorderRegistry)
          .get(CivilDisorder)
          .some((rule: CivilDisorder): boolean => rule.validate(city, yields))
    ),
    new Criterion((cityYield: Yield): boolean => cityYield.value() >= 0),
    new Effect((cityYield: Yield, city: City): void => {
      const cityBuild = cityBuildRegistry.getByCity(city);

      cityBuild.add(cityYield);
    })
  ),

  new ProcessYield(
    new Low(),
    new Criterion(
      (cityYield: Yield): boolean => cityYield instanceof Production
    ),
    new Effect((cityYield: Yield, city: City): void => {
      const cityBuild = cityBuildRegistry.getByCity(city);

      cityBuild.check();
    })
  ),

  new ProcessYield(
    new Low(),
    new Criterion(
      (cityYield: Yield): boolean => cityYield instanceof Production
    ),
    new Criterion((cityYield: Yield): boolean => cityYield.value() < 0),
    new Effect((cityYield: Yield, city: City): void => {
      unitRegistry
        .getByCity(city)
        .sort(
          (a: Unit, b: Unit): number =>
            a.tile().distanceFrom(city.tile()) -
            b.tile().distanceFrom(city.tile())
        )
        .slice(cityYield.value())
        // TODO: raise an event/Rule to listen for in the frontend `${city.name()} cannot support ${unit.constructor.name}`
        .forEach((unit: Unit): void => unit.destroy());
    })
  ),
];

export default getRules;
