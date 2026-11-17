"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BulidingCancelled_1 = require("@civ-clone/core-city-build/Rules/BulidingCancelled");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const autoBuildRules_1 = require("@civ-clone/base-city-auto-build/lib/autoBuildRules");
const autoBuild_1 = require("../../lib/autoBuild");
const events_1 = require("@civ-clone/base-city-lifecycle/lib/events");
const getRules = (ruleRegistry = RuleRegistry_1.instance, engine = Engine_1.instance) => [
    // A city has stopped building something, however it was dropped: told with the item and why, so a client can show
    //  the build as it is now, even in the middle of its player's turn (civ-clone/web-renderer#978).
    new BulidingCancelled_1.default('civ1-city:city/building-cancelled/emit', new Effect_1.default((cityBuild, item, reason) => {
        (0, events_1.emitBuildingCancelled)(cityBuild, item, reason, engine);
    })),
    // `civ1-city:city/building-cancelled/auto`: a city on Auto whose build can no longer be built chooses again
    //  (civ-clone/web-renderer#194).
    (0, autoBuildRules_1.autoBuildOnCancelled)({ ruleRegistry }, { include: autoBuild_1.autoBuildable, prefix: 'civ1-city' }),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=building-cancelled.js.map