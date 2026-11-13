import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  exhaustFood,
  grow,
  hasFoodToGrow,
  isFoodExhausted,
} from '@civ-clone/base-city-lifecycle/lib/foodStorage';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import FoodStorage from '@civ-clone/core-city-growth/Rules/FoodStorage';

export const getRules: (ruleRegistry?: RuleRegistry) => FoodStorage[] = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): FoodStorage[] => [
  new FoodStorage(
    'civ1-city:city/food-storage/grow',
    new Criterion((cityGrowth: CityGrowth): boolean =>
      hasFoodToGrow(cityGrowth)
    ),
    new Effect((cityGrowth: CityGrowth): void => grow(cityGrowth))
  ),
  new FoodStorage(
    'civ1-city:city/food-storage/exhausted',
    new Criterion((cityGrowth: CityGrowth): boolean =>
      isFoodExhausted(cityGrowth)
    ),
    new Effect((cityGrowth: CityGrowth): void => {
      exhaustFood(cityGrowth, ruleRegistry);
    })
  ),
];

export default getRules;
