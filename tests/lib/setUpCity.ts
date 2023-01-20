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
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import CanBeWorked from '@civ-clone/core-city/Rules/CanBeWorked';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import Priority from '@civ-clone/core-rule/Priority';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Tiles from '@civ-clone/core-city/Rules/Tiles';
import Tileset from '@civ-clone/core-world/Tileset';
import { Water } from '@civ-clone/core-terrain/Types';
import World from '@civ-clone/core-world/World';

export type setUpCityOptions = {
  name?: string;
  size?: number;
  improveTerrain?: boolean;
  ruleRegistry?: RuleRegistry;
  world?: World;
  tile?: Tile;
  player?: Player;
  tileImprovementRegistry?: TileImprovementRegistry;
  playerWorldRegistry?: PlayerWorldRegistry;
  cityGrowthRegistry?: CityGrowthRegistry;
  workedTileRegistry?: WorkedTileRegistry;
};

export const setUpCity = async ({
  name = '',
  size = 1,
  improveTerrain = true,
  ruleRegistry = ruleRegistryInstance,
  player = new Player(ruleRegistry),
  playerWorldRegistry = playerWorldRegistryInstance,
  world,
  tile,
  tileImprovementRegistry = tileImprovementRegistryInstance,
  cityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry = workedTileRegistryInstance,
}: setUpCityOptions = {}): Promise<City> => {
  ruleRegistry.register(
    new Tiles(
      new Priority(9000), // Very low priority so it can be overridden with a `Normal` `Priority` `Rule`
      new Effect((city: City): Tileset => city.tile().getSurroundingArea(2))
    ),
    new CanBeWorked(
      new Effect(
        (tile: Tile): boolean => !workedTileRegistry.tileIsWorked(tile)
      )
    )
  );

  if (world === undefined) {
    world = await generateWorld(
      generateGenerator(5, 5, Grassland),
      ruleRegistry
    );

    playerWorldRegistry.register(new PlayerWorld(player, world));
  }

  try {
    playerWorldRegistry.getByPlayer(player);
  } catch (e) {
    playerWorldRegistry.register(new PlayerWorld(player, world));
  }

  if (tile === undefined) {
    tile = world.get(2, 2);
  }

  return new Promise<City>((resolve) => {
    Tileset.fromSurrounding(tile as Tile).forEach((tile: Tile): void => {
      playerWorldRegistry.getByPlayer(player).register(tile);

      if (!improveTerrain || tile.terrain() instanceof Water) {
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

    const city = new City(
      player,
      tile as Tile,
      name,
      ruleRegistry,
      workedTileRegistry
    );

    let cityGrowth;

    try {
      cityGrowth = cityGrowthRegistry.getByCity(city);
    } catch (e) {
      cityGrowth = new CityGrowth(city, ruleRegistry);

      cityGrowthRegistry.register(cityGrowth);
    }

    if (size > 1) {
      while (cityGrowth.size() < size) {
        cityGrowth.grow();
      }
    }

    resolve(city);
  });
};

export default setUpCity;
