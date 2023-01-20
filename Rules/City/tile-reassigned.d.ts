import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
export declare const getRules: (
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => TileReassigned[];
export default getRules;
