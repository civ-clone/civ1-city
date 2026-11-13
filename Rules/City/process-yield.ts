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
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  buildWithProduction,
  storeFood,
} from '@civ-clone/base-city-lifecycle/lib/processYield';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import { UnitSupportProduction } from '../../Yields';
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
    'civ1-city:city/process-yield/food',
    new Criterion(
      (cityYield: Yield): cityYield is Food => cityYield instanceof Food
    ),
    // The city's food, net of what its citizens and units eat, goes into its store, which may run out: a city short of
    //  food loses a unit it feeds (or a citizen) only when it does, not as soon as it is short (`FoodExhausted`,
    //  civ-clone/web-renderer#969).
    new Effect((cityYield: Food, city: City): void => {
      storeFood(cityYield, city, cityGrowthRegistry);
    })
  ),

  new ProcessYield(
    'civ1-city:city/process-yield/production',
    new Criterion(
      (cityYield: Yield): cityYield is Production =>
        cityYield instanceof Production
    ),
    // Units the city can't support go, furthest first, and there's no production while there's civil disorder.
    new Effect(
      (cityYield: Production, city: City, cityYields: Yield[]): void => {
        buildWithProduction(
          cityYield,
          city,
          cityYields,
          UnitSupportProduction,
          cityBuildRegistry,
          ruleRegistry
        );
      }
    )
  ),
];

export default getRules;
