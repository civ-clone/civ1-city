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
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const CityBuild_1 = require("@civ-clone/core-city-build/CityBuild");
const CityGrowth_1 = require("@civ-clone/core-city-growth/CityGrowth");
const Created_1 = require("@civ-clone/core-city/Rules/Created");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TileReassigned_1 = require("@civ-clone/core-city/Rules/TileReassigned");
const WorkedTile_1 = require("@civ-clone/core-city/WorkedTile");
const assignWorkers_1 = require("../../lib/assignWorkers");
const getRules = (tileImprovementRegistry = TileImprovementRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, cityRegistry = CityRegistry_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, availableBuildItemsRegistry = AvailableCityBuildItemsRegistry_1.instance, engine = Engine_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => [
    ...[TileImprovements_1.Irrigation, TileImprovements_1.Road].map((TileImprovementType) => new Created_1.default(new Criterion_1.default((city) => tileImprovementRegistry
        .getByTile(city.tile())
        .every((tileImprovement) => !(tileImprovement instanceof TileImprovementType))), new Effect_1.default((city) => tileImprovementRegistry.register(new TileImprovementType(city.tile()))))),
    new Created_1.default(new Effect_1.default((city) => cityBuildRegistry.register(new CityBuild_1.default(city, availableBuildItemsRegistry, ruleRegistry)))),
    new Created_1.default(new Effect_1.default((city) => cityGrowthRegistry.register(new CityGrowth_1.default(city, ruleRegistry)))),
    new Created_1.default(new Effect_1.default((city) => cityRegistry.register(city))),
    new Created_1.default(new Effect_1.default((city) => {
        engine.emit('city:created', city);
    })),
    new Created_1.default(new Effect_1.default((city) => {
        const existingWorkedTile = workedTileRegistry.getByTile(city.tile());
        if (existingWorkedTile !== null) {
            workedTileRegistry.unregister(existingWorkedTile);
        }
        workedTileRegistry.register(new WorkedTile_1.default(city.tile(), city));
        // Give the existing City the chance to reassign its worker before...
        if (existingWorkedTile !== null) {
            ruleRegistry.process(TileReassigned_1.default, existingWorkedTile.city(), existingWorkedTile.tile());
        }
        // ...assigning the remaining workers.
        (0, assignWorkers_1.default)(city, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=created.js.map