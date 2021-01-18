"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const getRules = (engine = Engine_1.instance) => [
    new BulidingComplete_1.default(new Effect_1.default((cityBuild, built) => {
        engine.emit('city:building-complete', cityBuild, built);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=building-complete.js.map