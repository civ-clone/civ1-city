"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Actions_1 = require("@civ-clone/civ1-unit/Actions");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Defeated_1 = require("@civ-clone/core-unit/Rules/Defeated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (cityRegistry = CityRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, engine = Engine_1.instance) => [
    new Defeated_1.default(new Criterion_1.default((defeated, by, action) => action instanceof Actions_1.Attack &&
        action.to() === defeated.tile() &&
        cityRegistry.getByTile(action.to()).length > 0), new Effect_1.default((defeated) => {
        const [city] = cityRegistry.getByTile(defeated.tile()), cityGrowth = cityGrowthRegistry.getByCity(city);
        cityGrowth.shrink();
    })),
    new Defeated_1.default(new Effect_1.default((defeated, by, action) => engine.emit('unit:defeated', defeated, by, action))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=defeated.js.map