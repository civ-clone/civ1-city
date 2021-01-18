import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import FoodStorage from '@civ-clone/core-city-growth/Rules/FoodStorage';

export const getRules: () => FoodStorage[] = (): FoodStorage[] => [
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
    new Effect((cityGrowth: CityGrowth): void => cityGrowth.shrink())
  ),
];

export default getRules;
