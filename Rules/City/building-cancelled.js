"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const autoBuildRules_1 = require("@civ-clone/base-city-auto-build/lib/autoBuildRules");
const autoBuild_1 = require("../../lib/autoBuild");
const getRules = (ruleRegistry = RuleRegistry_1.instance) => [
    // `civ1-city:city/building-cancelled/auto`: a city on Auto whose build can no longer be built chooses again
    //  (civ-clone/web-renderer#194).
    (0, autoBuildRules_1.autoBuildOnCancelled)({ ruleRegistry }, { include: autoBuild_1.autoBuildable, prefix: 'civ1-city' }),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=building-cancelled.js.map