"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const AvailableCityBuildItemsRegistry_1 = require("@civ-clone/core-city-build/AvailableCityBuildItemsRegistry");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const CityBuild_1 = require("@civ-clone/core-city-build/CityBuild");
const CityGrowth_1 = require("@civ-clone/core-city-growth/CityGrowth");
const Created_1 = require("@civ-clone/core-city/Rules/Created");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const assignWorkers_1 = require("../../lib/assignWorkers");
const getRules = (tileImprovementRegistry = TileImprovementRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, cityRegistry = CityRegistry_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, availableBuildItemsRegistry = AvailableCityBuildItemsRegistry_1.instance, engine = Engine_1.instance) => [
    new Created_1.default(new Effect_1.default((city) => {
        [TileImprovements_1.Irrigation, TileImprovements_1.Road].forEach((Improvement) => tileImprovementRegistry.register(new Improvement(city.tile())));
    })),
    new Created_1.default(new Effect_1.default((city) => cityBuildRegistry.register(new CityBuild_1.default(city, availableBuildItemsRegistry, ruleRegistry)))),
    new Created_1.default(new Effect_1.default((city) => cityGrowthRegistry.register(new CityGrowth_1.default(city, ruleRegistry)))),
    new Created_1.default(new Effect_1.default((city) => cityRegistry.register(city))),
    new Created_1.default(new Effect_1.default((city) => {
        engine.emit('city:created', city);
    })),
    new Created_1.default(new Effect_1.default((city) => (0, assignWorkers_1.default)(city, playerWorldRegistry, cityGrowthRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=created.js.map