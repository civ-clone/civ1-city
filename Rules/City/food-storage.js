"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const FoodStorage_1 = require("@civ-clone/core-city-growth/Rules/FoodStorage");
const getRules = () => [
    new FoodStorage_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.progress().value() >= cityGrowth.cost().value()), new Effect_1.default((cityGrowth) => cityGrowth.grow())),
    new FoodStorage_1.default(new Criterion_1.default((cityGrowth) => cityGrowth.progress().value() < 0), new Effect_1.default((cityGrowth) => cityGrowth.shrink())),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=food-storage.js.map