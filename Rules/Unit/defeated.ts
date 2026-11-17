import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import { Attack } from '@civ-clone/civ1-unit/Actions';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';

export const getRules: (
  cityRegistry?: CityRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => Defeated[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): Defeated[] => [
  // After `civ1-unit`'s `unit/defeated/emit-and-destroy`, which is High: the attacker's win destroys the defender, and
  //  counts it as a loss, before the city shrinks, as v474.05's `battle` (`BATTLE.C`) drops the defender before `vanish`
  //  (`CONTROL.C`) removes a city of size 1 (civ-clone/web-renderer#1000). Not Low: other packages' `Defeated` rules
  //  (the computer player's, which may buy a defender for an empty city) should still see a city of size 1 gone.
  //  `civ1-unit`'s rule also announces the defeat (`unit:defeated`).
  new Defeated(
    'civ1-city:unit/defeated/shrink-defended-city',
    new Criterion(
      (defeated, by, action) =>
        action instanceof Attack &&
        action.to() === defeated.tile() &&
        cityRegistry.getByTile(action.to()) !== null
    ),
    new Effect((defeated, by, action) => {
      const city = cityRegistry.getByTile(defeated.tile());

      // Gone already, should an earlier rule have taken it.
      if (city === null) {
        return;
      }

      cityGrowthRegistry.getByCity(city).shrink(action);
    })
  ),
];

export default getRules;
