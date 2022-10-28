"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const FoodExhausted_1 = require("@civ-clone/core-city-growth/Rules/FoodExhausted");
const getRules = () => [
    new FoodExhausted_1.default(new Effect_1.default((cityGrowth) => cityGrowth.shrink())),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=food-exhausted.js.map