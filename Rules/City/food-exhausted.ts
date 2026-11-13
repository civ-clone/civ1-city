import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  emitFoodStorageExhausted,
  emptyFoodStore,
  foodSupportedUnit as baseFoodSupportedUnit,
  loseFoodSupportedUnit,
  shrinkFromFamine,
} from '@civ-clone/base-city-lifecycle/lib/famine';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import FoodExhausted from '@civ-clone/core-city-growth/Rules/FoodExhausted';
import Unit from '@civ-clone/core-unit/Unit';
import { UnitSupportFood } from '../../Yields';

// The first unit the city feeds, in the order its units were built (Settlers, in Civ1), or `null`.
const foodSupportedUnit = (cityGrowth: CityGrowth): Unit | null =>
  baseFoodSupportedUnit(cityGrowth, UnitSupportFood);

// When a city's food store runs out, v474.05 loses one Settlers the city supports, or failing that a citizen, and empties
//  the store (civd `CITYMGT.C` `city_process()`):
//
//    if (townbuf[city].food_box < 0) {
//        scratch_i = -1;
//        for (index_i = 0; index_i < 128; index_i++) {
//            if (armydata[selected_owner][index_i].type == UTYPE_SETTLERS && armydata[selected_owner][index_i].home_city == city) {
//                scratch_i = index_i;
//                break;
//    …
//        strcat(msgtext, (scratch_i != -1) ? "!\nSettlers lost.\n" : "!\nFamine feared.\n");
//    …
//        if (scratch_i != -1) {
//            drop_u_stack(selected_owner, scratch_i);
//        } else {
//            if (--townbuf[city].size == 0) {
//                vanish(city, townbuf[city].x, townbuf[city].y);
//    …
//        townbuf[city].food_box = 0;
//
// The store only goes below 0 once the turn's food is added to it (`food_box += town_res_sums[0] - size * 2 -
//  colonist_homed * sett_food_j`), so a city short of food eats into its store first, and loses nothing until it is
//  empty (civ-clone/web-renderer#969). v474.05 checks at the start of the city's next turn; this checks as the food is
//  added, as growth is.
export const getRules: (engine?: Engine) => FoodExhausted[] = (
  engine: Engine = engineInstance
): FoodExhausted[] => [
  // Before the city shrinks, so the famine is known when its shrinking (or its destruction) is (civ-clone/web-renderer#400).
  //  With the unit lost to it, if any: v474.05 says "Settlers lost." in place of "Famine feared." (#969).
  new FoodExhausted(
    'civ1-city:city/food-exhausted/emit',
    new Effect((cityGrowth: CityGrowth): void => {
      emitFoodStorageExhausted(
        cityGrowth,
        foodSupportedUnit(cityGrowth),
        engine
      );
    })
  ),
  // One, in place of a citizen, whatever the city's size (#969).
  new FoodExhausted(
    'civ1-city:city/food-exhausted/lose-food-supported-unit',
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        foodSupportedUnit(cityGrowth) !== null
    ),
    new Effect((cityGrowth: CityGrowth): void =>
      loseFoodSupportedUnit(cityGrowth, UnitSupportFood)
    )
  ),
  new FoodExhausted(
    'civ1-city:city/food-exhausted/shrink',
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        foodSupportedUnit(cityGrowth) === null
    ),
    new Effect((cityGrowth: CityGrowth): void => shrinkFromFamine(cityGrowth))
  ),
  // Either way (#969).
  new FoodExhausted(
    'civ1-city:city/food-exhausted/empty-food-store',
    new Effect((cityGrowth: CityGrowth): void => emptyFoodStore(cityGrowth))
  ),
];

export default getRules;
