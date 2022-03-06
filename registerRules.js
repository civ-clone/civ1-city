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
RuleRegistry_1.instance.register(...(0, building_complete_1.default)(), ...(0, captured_1.default)(), ...(0, cost_1.default)(), ...(0, created_1.default)(), ...(0, destroyed_1.default)(), ...(0, food_storage_1.default)(), ...(0, grow_1.default)(), ...(0, growth_cost_1.default)(), ...(0, action_1.default)(), ...(0, process_yield_1.default)(), ...(0, shrink_1.default)());
//# sourceMappingURL=registerRules.js.map