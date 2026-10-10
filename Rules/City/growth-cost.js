"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const level_1 = require("@civ-clone/civ1-difficulty/level");
const Cost_1 = require("@civ-clone/core-city-growth/Rules/Cost");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
// A city grows at (size + 1) × the player's production ratio: 10 for the human, and 16 down to 8 for the computer
//  players, Chieftain to Emperor (v474.05 `CityWorker.cs` L217-L224).
const getRules = (gameDifficultyRegistry = GameDifficultyRegistry_1.instance, clientRegistry = ClientRegistry_1.instance) => [
    new Cost_1.default('civ1-city:city/growth-cost/by-size', new Effect_1.default((cityGrowth) => (0, level_1.productionRatio)((0, level_1.levelOf)(gameDifficultyRegistry), (0, isHuman_1.default)(cityGrowth.city().player(), clientRegistry)) *
        (cityGrowth.size() + 1))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=growth-cost.js.map