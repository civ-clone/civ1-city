import { AvailableSpecialistRegistry } from '@civ-clone/core-city/AvailableSpecialistRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import Grow from '@civ-clone/core-city-growth/Rules/Grow';
export declare const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => Grow[];
export default getRules;
