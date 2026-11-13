"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const famine_1 = require("@civ-clone/base-city-lifecycle/lib/famine");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const FoodExhausted_1 = require("@civ-clone/core-city-growth/Rules/FoodExhausted");
const Yields_1 = require("../../Yields");
// The first unit the city feeds, in the order its units were built (Settlers, in Civ1), or `null`.
const foodSupportedUnit = (cityGrowth) => (0, famine_1.foodSupportedUnit)(cityGrowth, Yields_1.UnitSupportFood);
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
const getRules = (engine = Engine_1.instance) => [
    // Before the city shrinks, so the famine is known when its shrinking (or its destruction) is (civ-clone/web-renderer#400).
    //  With the unit lost to it, if any: v474.05 says "Settlers lost." in place of "Famine feared." (#969).
    new FoodExhausted_1.default('civ1-city:city/food-exhausted/emit', new Effect_1.default((cityGrowth) => {
        (0, famine_1.emitFoodStorageExhausted)(cityGrowth, foodSupportedUnit(cityGrowth), engine);
    })),
    // One, in place of a citizen, whatever the city's size (#969).
    new FoodExhausted_1.default('civ1-city:city/food-exhausted/lose-food-supported-unit', new Criterion_1.default((cityGrowth) => foodSupportedUnit(cityGrowth) !== null), new Effect_1.default((cityGrowth) => (0, famine_1.loseFoodSupportedUnit)(cityGrowth, Yields_1.UnitSupportFood))),
    new FoodExhausted_1.default('civ1-city:city/food-exhausted/shrink', new Criterion_1.default((cityGrowth) => foodSupportedUnit(cityGrowth) === null), new Effect_1.default((cityGrowth) => (0, famine_1.shrinkFromFamine)(cityGrowth))),
    // Either way (#969).
    new FoodExhausted_1.default('civ1-city:city/food-exhausted/empty-food-store', new Effect_1.default((cityGrowth) => (0, famine_1.emptyFoodStore)(cityGrowth))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=food-exhausted.js.map