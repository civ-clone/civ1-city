import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import World from '@civ-clone/core-world/World';
export declare type setUpCityOptions = {
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
};
export declare const setUpCity: ({
  name,
  size,
  improveTerrain,
  ruleRegistry,
  player,
  playerWorldRegistry,
  world,
  tile,
  tileImprovementRegistry,
  cityGrowthRegistry,
}?: setUpCityOptions) => Promise<City>;
export default setUpCity;
