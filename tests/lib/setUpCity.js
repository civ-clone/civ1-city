"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpCity = void 0;
const Terrains_1 = require("@civ-clone/base-terrain-civ1/Terrains");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const TileImprovements_1 = require("@civ-clone/base-terrain-civ1/TileImprovements");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const City_1 = require("@civ-clone/core-city/City");
const FillGenerator_1 = require("@civ-clone/base-world-generator/tests/lib/FillGenerator");
const Player_1 = require("@civ-clone/core-player/Player");
const PlayerWorld_1 = require("@civ-clone/core-player-world/PlayerWorld");
const TerrainFeatures_1 = require("@civ-clone/base-terrain-civ1/TerrainFeatures");
const Tileset_1 = require("@civ-clone/core-world/Tileset");
const Types_1 = require("@civ-clone/core-terrain/Types");
const World_1 = require("@civ-clone/core-world/World");
const setUpCity = ({ name = '', size = 1, ruleRegistry = RuleRegistry_1.instance, player = new Player_1.default(ruleRegistry), playerWorldRegistry = PlayerWorldRegistry_1.instance, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance, world = (() => {
    const generator = new FillGenerator_1.default(5, 5, Terrains_1.Grassland), world = new World_1.default(generator);
    world.build(ruleRegistry);
    world
        .entries()
        .forEach((tile) => terrainFeatureRegistry.register(new TerrainFeatures_1.Shield(tile.terrain())));
    try {
        playerWorldRegistry.getByPlayer(player);
    }
    catch (e) {
        const playerWorld = new PlayerWorld_1.default(player, world);
        playerWorldRegistry.register(playerWorld);
    }
    return world;
})(), tile = world.get(2, 2), tileImprovementRegistry = TileImprovementRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, } = {}) => {
    Tileset_1.default.fromSurrounding(tile).forEach((tile) => {
        playerWorldRegistry.getByPlayer(player).register(tile);
        if (tile.terrain() instanceof Types_1.Water) {
            return;
        }
        if ([Terrains_1.Desert, Terrains_1.Grassland, Terrains_1.Hills, Terrains_1.Plains, Terrains_1.River].some((IrrigatableTerrain) => tile.terrain() instanceof IrrigatableTerrain)) {
            tileImprovementRegistry.register(new TileImprovements_1.Irrigation(tile));
        }
        else if ([Terrains_1.Hills, Terrains_1.Mountains].some((MineableTerrain) => tile.terrain() instanceof MineableTerrain)) {
            tileImprovementRegistry.register(new TileImprovements_1.Mine(tile));
        }
        if (![Terrains_1.Arctic, Terrains_1.Ocean, Terrains_1.River].some((UnroadableTerrain) => tile.terrain() instanceof UnroadableTerrain)) {
            tileImprovementRegistry.register(new TileImprovements_1.Road(tile));
        }
    });
    const city = new City_1.default(player, tile, name, ruleRegistry);
    if (size > 1) {
        const cityGrowth = cityGrowthRegistry.getByCity(city);
        while (cityGrowth.size() < size) {
            cityGrowth.grow();
        }
    }
    return city;
};
exports.setUpCity = setUpCity;
exports.default = exports.setUpCity;
//# sourceMappingURL=setUpCity.js.map