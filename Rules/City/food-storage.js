"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const foodStorage_1 = require("@civ-clone/base-city-lifecycle/lib/foodStorage");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const FoodStorage_1 = require("@civ-clone/core-city-growth/Rules/FoodStorage");
const getRules = (ruleRegistry = RuleRegistry_1.instance) => [
    new FoodStorage_1.default('civ1-city:city/food-storage/grow', new Criterion_1.default((cityGrowth) => (0, foodStorage_1.hasFoodToGrow)(cityGrowth)), new Effect_1.default((cityGrowth) => (0, foodStorage_1.grow)(cityGrowth))),
    new FoodStorage_1.default('civ1-city:city/food-storage/exhausted', new Criterion_1.default((cityGrowth) => (0, foodStorage_1.isFoodExhausted)(cityGrowth)), new Effect_1.default((cityGrowth) => {
        (0, foodStorage_1.exhaustFood)(cityGrowth, ruleRegistry);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=food-storage.js.map