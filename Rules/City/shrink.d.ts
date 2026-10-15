import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import Shrink from '@civ-clone/core-city-growth/Rules/Shrink';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
export declare const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  engine?: Engine
) => Shrink[];
export default getRules;
