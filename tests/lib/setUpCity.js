"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpCity = void 0;
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const buildWorld_1 = require("@civ-clone/core-world/tests/lib/buildWorld");
const City_1 = require("@civ-clone/core-city/City");
const CityGrowth_1 = require("@civ-clone/core-city-growth/CityGrowth");
const Player_1 = require("@civ-clone/core-player/Player");
const PlayerWorld_1 = require("@civ-clone/core-player-world/PlayerWorld");
const Tileset_1 = require("@civ-clone/core-world/Tileset");
const Types_1 = require("@civ-clone/core-terrain/Types");
const setUpCity = async ({ name = '', size = 1, improveTerrain = true, ruleRegistry = RuleRegistry_1.instance, player = new Player_1.default(ruleRegistry), playerWorldRegistry = PlayerWorldRegistry_1.instance, world, tile, tileImprovementRegistry = TileImprovementRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, } = {}) => {
    if (world === undefined) {
        world = await (0, buildWorld_1.generateWorld)((0, buildWorld_1.generateGenerator)(5, 5, Terrains_1.Grassland), ruleRegistry);
        playerWorldRegistry.register(new PlayerWorld_1.default(player, world));
    }
    try {
        playerWorldRegistry.getByPlayer(player);
    }
    catch (e) {
        playerWorldRegistry.register(new PlayerWorld_1.default(player, world));
    }
    if (tile === undefined) {
        tile = world.get(2, 2);
    }
    return new Promise((resolve) => {
        Tileset_1.default.fromSurrounding(tile).forEach((tile) => {
            playerWorldRegistry.getByPlayer(player).register(tile);
            if (!improveTerrain || tile.terrain() instanceof Types_1.Water) {
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
            let cityGrowth;
            try {
                cityGrowth = cityGrowthRegistry.getByCity(city);
            }
            catch (e) {
                cityGrowth = new CityGrowth_1.default(city, ruleRegistry);
                cityGrowthRegistry.register(cityGrowth);
            }
            while (cityGrowth.size() < size) {
                cityGrowth.grow();
            }
        }
        resolve(city);
    });
};
exports.setUpCity = setUpCity;
exports.default = exports.setUpCity;
//# sourceMappingURL=setUpCity.js.map