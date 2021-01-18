import Cost from '@civ-clone/core-city-growth/Rules/Cost';
import Effect from '@civ-clone/core-rule/Effect';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';

export const getRules: () => Cost[] = (): Cost[] => [
  new Cost(
    new Effect((cityGrowth: CityGrowth): number => 10 * (cityGrowth.size() + 1))
  ),
];

export default getRules;
