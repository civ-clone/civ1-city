import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import { AvailableSpecialistRegistry } from '@civ-clone/core-city/AvailableSpecialistRegistry';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
export declare const getRules: (
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => TileReassigned[];
export default getRules;
