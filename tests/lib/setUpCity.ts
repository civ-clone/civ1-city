import {
  Arctic,
  Desert,
  Grassland,
  Hills,
  Mountains,
  Ocean,
  Plains,
  River,
} from '@civ-clone/civ1-world/Terrains';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { Irrigation, Mine, Road } from '@civ-clone/civ1-world/TileImprovements';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TerrainFeatureRegistry,
  instance as terrainFeatureRegistryInstance,
} from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import Player from '@civ-clone/core-player/Player';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import { Shield } from '@civ-clone/civ1-world/TerrainFeatures';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Tileset from '@civ-clone/core-world/Tileset';
import { Water } from '@civ-clone/core-terrain/Types';
import World from '@civ-clone/core-world/World';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';

export const setUpCity = ({
  name = '',
  size = 1,
  ruleRegistry = ruleRegistryInstance,
  player = new Player(ruleRegistry),
  playerWorldRegistry = playerWorldRegistryInstance,
  terrainFeatureRegistry = terrainFeatureRegistryInstance,
  world = ((): World => {
    const generator = new FillGenerator(5, 5, Grassland),
      world = new World(generator);

    world.build(ruleRegistry);

    world
      .entries()
      .forEach((tile: Tile) =>
        terrainFeatureRegistry.register(new Shield(tile.terrain()))
      );

    try {
      playerWorldRegistry.getByPlayer(player);
    } catch (e) {
      const playerWorld = new PlayerWorld(player, world);

      playerWorldRegistry.register(playerWorld);
    }

    return world;
  })(),
  tile = world.get(2, 2),
  tileImprovementRegistry = tileImprovementRegistryInstance,
  cityGrowthRegistry = cityGrowthRegistryInstance,
}: {
  name?: string;
  size?: number;
  ruleRegistry?: RuleRegistry;
  world?: World;
  tile?: Tile;
  player?: Player;
  tileImprovementRegistry?: TileImprovementRegistry;
  terrainFeatureRegistry?: TerrainFeatureRegistry;
  playerWorldRegistry?: PlayerWorldRegistry;
  cityGrowthRegistry?: CityGrowthRegistry;
} = {}) => {
  Tileset.fromSurrounding(tile).forEach((tile: Tile): void => {
    playerWorldRegistry.getByPlayer(player).register(tile);

    if (tile.terrain() instanceof Water) {
      return;
    }

    if (
      [Desert, Grassland, Hills, Plains, River].some(
        (IrrigatableTerrain: typeof Terrain): boolean =>
          tile.terrain() instanceof IrrigatableTerrain
      )
    ) {
      tileImprovementRegistry.register(new Irrigation(tile));
    } else if (
      [Hills, Mountains].some(
        (MineableTerrain: typeof Terrain): boolean =>
          tile.terrain() instanceof MineableTerrain
      )
    ) {
      tileImprovementRegistry.register(new Mine(tile));
    }

    if (
      ![Arctic, Ocean, River].some(
        (UnroadableTerrain: typeof Terrain): boolean =>
          tile.terrain() instanceof UnroadableTerrain
      )
    ) {
      tileImprovementRegistry.register(new Road(tile));
    }
  });

  const city = new City(player, tile, name, ruleRegistry);

  if (size > 1) {
    let cityGrowth;

    try {
      cityGrowth = cityGrowthRegistry.getByCity(city);
    } catch (e) {
      cityGrowth = new CityGrowth(city, ruleRegistry);

      cityGrowthRegistry.register(cityGrowth);
    }

    while (cityGrowth.size() < size) {
      cityGrowth.grow();
    }
  }

  return city;
};

export default setUpCity;
