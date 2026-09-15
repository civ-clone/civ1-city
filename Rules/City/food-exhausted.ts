import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Effect from '@civ-clone/core-rule/Effect';
import FoodExhausted from '@civ-clone/core-city-growth/Rules/FoodExhausted';

export const getRules: () => FoodExhausted[] = (): FoodExhausted[] => [
  new FoodExhausted(
    'civ1-city:city/food-exhausted/shrink',
    new Effect((cityGrowth: CityGrowth): void => cityGrowth.shrink())
  ),
];

export default getRules;
