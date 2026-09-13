"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const building_complete_1 = require("./Rules/City/building-complete");
const can_be_worked_1 = require("./Rules/City/can-be-worked");
const captured_1 = require("./Rules/City/captured");
const cost_1 = require("./Rules/City/cost");
const created_1 = require("./Rules/City/created");
const destroyed_1 = require("./Rules/City/destroyed");
const food_exhausted_1 = require("./Rules/City/food-exhausted");
const food_storage_1 = require("./Rules/City/food-storage");
const grow_1 = require("./Rules/City/grow");
const growth_cost_1 = require("./Rules/City/growth-cost");
const process_yield_1 = require("./Rules/City/process-yield");
const shrink_1 = require("./Rules/City/shrink");
const tile_reassigned_1 = require("./Rules/City/tile-reassigned");
const tiles_1 = require("./Rules/City/tiles");
const yield_1 = require("./Rules/City/yield");
const action_1 = require("./Rules/Player/action");
const defeated_1 = require("./Rules/Unit/defeated");
const moved_1 = require("./Rules/Unit/moved");
const unsupported_1 = require("./Rules/Unit/unsupported");
const core_game_1 = require("@civ-clone/core-game");
const register = (game) => game.rules.register(...(0, building_complete_1.default)(game.engine), ...(0, can_be_worked_1.default)(game.cities, game.units, game.workedTiles), ...(0, captured_1.default)(game.cities, game.units, game.cityGrowth, game.cityBuilds, game.engine, game.playerWorlds, game.workedTiles), ...(0, cost_1.default)(game.cityGrowth, game.playerGovernments, game.units), ...(0, created_1.default)(game.tileImprovements, game.cityBuilds, game.cityGrowth, game.cities, game.playerWorlds, game.rules, game.availableCityBuildItems, game.engine, game.workedTiles), ...(0, destroyed_1.default)(game.tileImprovements, game.cities, game.engine, game.units, game.workedTiles), ...(0, food_exhausted_1.default)(), ...(0, food_storage_1.default)(game.rules), ...(0, grow_1.default)(game.cityGrowth, game.playerWorlds, game.workedTiles), ...(0, growth_cost_1.default)(), ...(0, process_yield_1.default)(game.cityBuilds, game.cityGrowth, game.units, game.rules), ...(0, shrink_1.default)(game.cityGrowth, game.playerWorlds, game.workedTiles), ...(0, tiles_1.default)(), ...(0, tile_reassigned_1.default)(game.playerWorlds, game.cityGrowth, game.workedTiles), ...(0, yield_1.default)(game.cityImprovements, game.playerGovernments), ...(0, action_1.default)(game.cityBuilds, game.cities), ...(0, defeated_1.default)(game.cities, game.cityGrowth, game.engine), ...(0, moved_1.default)(game.rules, game.workedTiles), ...(0, unsupported_1.default)());
exports.register = register;
// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map