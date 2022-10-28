import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import FoodStorage from '@civ-clone/core-city-growth/Rules/FoodStorage';
import FoodExhausted from '@civ-clone/core-city-growth/Rules/FoodExhausted';

export const getRules: (ruleRegistry?: RuleRegistry) => FoodStorage[] = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): FoodStorage[] => [
  new FoodStorage(
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        cityGrowth.progress().value() >= cityGrowth.cost().value()
    ),
    new Effect((cityGrowth: CityGrowth): void => cityGrowth.grow())
  ),
  new FoodStorage(
    new Criterion(
      (cityGrowth: CityGrowth): boolean => cityGrowth.progress().value() < 0
    ),
    new Effect((cityGrowth: CityGrowth): void => {
      ruleRegistry.process(FoodExhausted, cityGrowth);
    })
  ),
];

export default getRules;
