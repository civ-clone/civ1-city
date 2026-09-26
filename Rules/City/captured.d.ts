import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { AvailableSpecialistRegistry } from '@civ-clone/core-city/AvailableSpecialistRegistry';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
import Captured from '@civ-clone/core-city/Rules/Captured';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
export declare const getRules: (
  cityRegistry?: CityRegistry,
  unitRegistry?: UnitRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  engine?: Engine,
  playerWorldRegistry?: PlayerWorldRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => Captured[];
export default getRules;
