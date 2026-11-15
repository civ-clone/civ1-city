"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const autoBuildRules_1 = require("@civ-clone/base-city-auto-build/lib/autoBuildRules");
const autoBuild_1 = require("../../lib/autoBuild");
const getRules = (engine = Engine_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    new BulidingComplete_1.default('civ1-city:city/building-complete/emit', new Effect_1.default((cityBuild, built) => {
        engine.emit('city:building-complete', cityBuild, built);
    })),
    // `civ1-city:city/building-complete/auto`: a city on Auto goes straight on to what it needs next
    //  (civ-clone/web-renderer#194).
    (0, autoBuildRules_1.autoBuildOnComplete)({ ruleRegistry }, { include: autoBuild_1.autoBuildable, prefix: 'civ1-city' }),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=building-complete.js.map