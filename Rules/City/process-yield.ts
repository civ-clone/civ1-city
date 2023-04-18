import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { Food, Production } from '../..//Yields';
import {
  FoodStorage,
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
import CivilDisorder from '@civ-clone/core-city-happiness/Rules/CivilDisorder';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import Unsupported from '@civ-clone/core-unit/Rules/Unsupported';
import Yield from '@civ-clone/core-yield/Yield';

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
    new Criterion(
      (cityYield: Yield): cityYield is Food => cityYield instanceof Food
    ),
    new Effect((cityYield: Food, city: City, cityYields: Yield[]): void => {
      const cityGrowth = cityGrowthRegistry.getByCity(city),
        foodStorage = new FoodStorage(cityYield);

      cityYields.forEach((cityYield) => {
        if (
          !(cityYield instanceof UnitSupportFood) ||
          foodStorage.value() >= 0
        ) {
          return;
        }

        const unit = cityYield.unit();

        if (unit === null) {
          return;
        }

        ruleRegistry.process(Unsupported, city, unit, cityYield as Yield);

        foodStorage.subtract(cityYield as Yield);
      });

      cityGrowth.add(foodStorage);
      cityGrowth.check();
    })
  ),

  new ProcessYield(
    new Criterion(
      (cityYield: Yield): cityYield is Production =>
        cityYield instanceof Production
    ),
    new Effect(
      (cityYield: Production, city: City, cityYields: Yield[]): void => {
        const cityBuild = cityBuildRegistry.getByCity(city),
          availableProduction = cityYield.clone();

        (cityYields as (Yield | UnitSupportProduction)[])
          .filter(
            (cityYield): cityYield is UnitSupportProduction =>
              cityYield instanceof UnitSupportProduction
          )
          .sort(
            (yieldA, yieldB) =>
              (yieldB.unit()?.tile().distanceFrom(city.tile()) ?? 0) -
              (yieldA.unit()?.tile().distanceFrom(city.tile()) ?? 0)
          )
          .forEach((cityYield) => {
            if (availableProduction.value() >= 0) {
              return;
            }

            const unit = cityYield.unit();

            if (unit === null) {
              return;
            }

            ruleRegistry.process(Unsupported, city, unit, cityYield as Yield);

            availableProduction.subtract(cityYield as Yield);
          });

        const updatedCityYields = city.yields();

        // No production happens when there's civil disorder.
        if (
          !ruleRegistry
            .process(CivilDisorder, city, updatedCityYields)
            .some((result: boolean): boolean => result)
        ) {
          cityBuild.add(availableProduction);
        }

        cityBuild.check();
      }
    )
  ),
];

export default getRules;
