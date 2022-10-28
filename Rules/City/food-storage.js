"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const FoodStorage_1 = require("@civ-clone/core-city-growth/Rules/FoodStorage");
const FoodExhausted_1 = require("@civ-clone/core-city-growth/Rules/FoodExhausted");
const getRules = (ruleRegistry = RuleRegistry_1.instance) => [
    new FoodStorage_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.progress().value() >= cityGrowth.cost().value()), new Effect_1.default((cityGrowth) => cityGrowth.grow())),
    new FoodStorage_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.progress().value() < 0), new Effect_1.default((cityGrowth) => {
        ruleRegistry.process(FoodExhausted_1.default, cityGrowth);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=food-storage.js.map