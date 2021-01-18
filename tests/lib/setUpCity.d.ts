import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TerrainFeatureRegistry } from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import World from '@civ-clone/core-world/World';
export declare const setUpCity: ({
  name,
  size,
  ruleRegistry,
  player,
  playerWorldRegistry,
  terrainFeatureRegistry,
  world,
  tile,
  tileImprovementRegistry,
  cityGrowthRegistry,
}?: {
  name?: string | undefined;
  size?: number | undefined;
  ruleRegistry?:
    | RuleRegistry<
        import('@civ-clone/core-rule/Rule').Rule<any[], any>,
        any[],
        any
      >
    | undefined;
  world?: World | undefined;
  tile?: Tile | undefined;
  player?: Player | undefined;
  tileImprovementRegistry?: TileImprovementRegistry | undefined;
  terrainFeatureRegistry?: TerrainFeatureRegistry | undefined;
  playerWorldRegistry?: PlayerWorldRegistry | undefined;
  cityGrowthRegistry?: CityGrowthRegistry | undefined;
}) => City;
export default setUpCity;
