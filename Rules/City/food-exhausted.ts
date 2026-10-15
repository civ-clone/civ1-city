import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Effect from '@civ-clone/core-rule/Effect';
import FoodExhausted from '@civ-clone/core-city-growth/Rules/FoodExhausted';

export const getRules: (engine?: Engine) => FoodExhausted[] = (
  engine: Engine = engineInstance
): FoodExhausted[] => [
  // Before the city shrinks, so the famine is known when its shrinking (or its destruction) is (civ-clone/web-renderer#400).
  new FoodExhausted(
    'civ1-city:city/food-exhausted/emit',
    new Effect((cityGrowth: CityGrowth): void => {
      engine.emit('city:food-storage-exhausted', cityGrowth.city());
    })
  ),
  new FoodExhausted(
    'civ1-city:city/food-exhausted/shrink',
    new Effect((cityGrowth: CityGrowth): void => cityGrowth.shrink())
  ),
];

export default getRules;
