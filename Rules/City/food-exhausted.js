"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const FoodExhausted_1 = require("@civ-clone/core-city-growth/Rules/FoodExhausted");
const getRules = (engine = Engine_1.instance) => [
    // Before the city shrinks, so the famine is known when its shrinking (or its destruction) is (civ-clone/web-renderer#400).
    new FoodExhausted_1.default('civ1-city:city/food-exhausted/emit', new Effect_1.default((cityGrowth) => {
        engine.emit('city:food-storage-exhausted', cityGrowth.city());
    })),
    new FoodExhausted_1.default('civ1-city:city/food-exhausted/shrink', new Effect_1.default((cityGrowth) => cityGrowth.shrink())),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=food-exhausted.js.map