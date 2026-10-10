"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BulidingCancelled_1 = require("@civ-clone/core-city-build/Rules/BulidingCancelled");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const autoBuild_1 = require("../../lib/autoBuild");
const getRules = (ruleRegistry = RuleRegistry_1.instance) => [
    new BulidingCancelled_1.default(
    // A city on Auto whose build can no longer be built chooses again (civ-clone/web-renderer#194).
    'civ1-city:city/building-cancelled/auto', new Effect_1.default((cityBuild) => {
        (0, autoBuild_1.default)(cityBuild, ruleRegistry);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=building-cancelled.js.map