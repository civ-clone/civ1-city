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
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Player from '@civ-clone/core-player/Player';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Tileset from '@civ-clone/core-world/Tileset';
import { Water } from '@civ-clone/core-terrain/Types';
import World from '@civ-clone/core-world/World';

export const setUpCity = async ({
  name = '',
  size = 1,
  ruleRegistry = ruleRegistryInstance,
  player = new Player(ruleRegistry),
  playerWorldRegistry = playerWorldRegistryInstance,
  world,
  tile,
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
  playerWorldRegistry?: PlayerWorldRegistry;
  cityGrowthRegistry?: CityGrowthRegistry;
} = {}): Promise<City> => {
  if (world === undefined) {
    world = await generateWorld(generateGenerator(5, 5, Grassland));

    playerWorldRegistry.register(new PlayerWorld(player, world));
  }

  if (!playerWorldRegistry.getByPlayer(player)) {
    playerWorldRegistry.register(new PlayerWorld(player, world));
  }

  if (tile === undefined) {
    tile = world.get(2, 2);
  }

  return new Promise<City>((resolve) => {
    Tileset.fromSurrounding(tile as Tile).forEach((tile: Tile): void => {
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

    const city = new City(player, tile as Tile, name, ruleRegistry);

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

    resolve(city);
  });
};

export default setUpCity;
