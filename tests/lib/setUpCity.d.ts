import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import World from '@civ-clone/core-world/World';
import { YieldRegistry } from '@civ-clone/core-yield/YieldRegistry';
export declare const setUpCity: ({
  name,
  size,
  ruleRegistry,
  player,
  playerWorldRegistry,
  world,
  tile,
  tileImprovementRegistry,
  cityGrowthRegistry,
  yieldRegistry,
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
  playerWorldRegistry?: PlayerWorldRegistry | undefined;
  cityGrowthRegistry?: CityGrowthRegistry | undefined;
  yieldRegistry?: YieldRegistry | undefined;
}) => Promise<City>;
export default setUpCity;
