"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Cost_1 = require("@civ-clone/core-city-growth/Rules/Cost");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = () => [
    new Cost_1.default(new Effect_1.default((cityGrowth) => 10 * (cityGrowth.size() + 1))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=growth-cost.js.map