"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const building_complete_1 = require("./Rules/City/building-complete");
const captured_1 = require("./Rules/City/captured");
const cost_1 = require("./Rules/City/cost");
const created_1 = require("./Rules/City/created");
const destroyed_1 = require("./Rules/City/destroyed");
const food_storage_1 = require("./Rules/City/food-storage");
const grow_1 = require("./Rules/City/grow");
const growth_cost_1 = require("./Rules/City/growth-cost");
const action_1 = require("./Rules/Player/action");
const process_yield_1 = require("./Rules/City/process-yield");
const shrink_1 = require("./Rules/City/shrink");
RuleRegistry_1.instance.register(...building_complete_1.default(), ...captured_1.default(), ...cost_1.default(), ...created_1.default(), ...destroyed_1.default(), ...food_storage_1.default(), ...grow_1.default(), ...growth_cost_1.default(), ...action_1.default(), ...process_yield_1.default(), ...shrink_1.default());
//# sourceMappingURL=registerRules.js.map