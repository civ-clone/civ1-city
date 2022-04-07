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
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
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
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

export const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  unitRegistry?: UnitRegistry,
  ruleRegistry?: RuleRegistry,
  engine?: Engine
) => ProcessYield[] = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  engine: Engine = engineInstance
): ProcessYield[] => [
  new ProcessYield(
    new Criterion((cityYield: Yield): boolean => cityYield instanceof Food),
    new Effect((cityYield: Yield, city: City, cityYields: Yield[]): void => {
      const cityGrowth = cityGrowthRegistry.getByCity(city),
        foodStorage = new FoodStorage(cityYield),
        populationCost = reduceYield(cityYields, PopulationSupportFood);

      foodStorage.subtract(populationCost, PopulationSupportFood.name);

      if (foodStorage.value() < 0) {
        cityGrowth.empty();
        cityGrowth.shrink();

        engine.emit('city:food-storage-exhausted', city);

        // Recalculate these since they'll have changed
        cityYields = city.yields();
        foodStorage.set(
          reduceYield(cityYields, Food) -
            reduceYield(cityYields, PopulationSupportFood),
          'Shrink'
        );
      }

      cityYields.forEach((cityYield) => {
        if (cityYield instanceof UnitSupportFood) {
          if (foodStorage.value() < cityYield.value()) {
            const unit = cityYield.unit();

            unit.destroy();

            engine.emit('city:unit-unsupported', city, unit, cityYield);

            return;
          }

          foodStorage.subtract(cityYield.value(), cityYield.unit().id());
        }
      });

      if (foodStorage.value() > 0) {
        cityGrowth.add(foodStorage);
        cityGrowth.check();
      }
    })
  ),

  new ProcessYield(
    new Criterion(
      (cityYield: Yield): boolean => cityYield instanceof Production
    ),
    new Effect((cityYield: Yield, city: City, cityYields: Yield[]): void =>
      (
        cityYields.filter(
          (otherYield) => otherYield instanceof UnitSupportProduction
        ) as UnitSupportProduction[]
      )
        // Remove units further away from the city if we're out of resources
        .sort(
          (otherYieldA, otherYieldB) =>
            otherYieldA.unit().tile().distanceFrom(city.tile()) -
            otherYieldB.unit().tile().distanceFrom(city.tile())
        )
        .forEach((otherYield) => {
          if (cityYield.value() < otherYield.value()) {
            const unit = otherYield.unit();

            unit.destroy();

            engine.emit('city:unit-unsupported', city, unit, otherYield);

            return;
          }

          cityYield.subtract(otherYield.value(), otherYield.unit().id());
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
];

export default getRules;
