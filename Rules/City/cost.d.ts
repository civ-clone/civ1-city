import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import Cost from '@civ-clone/core-city/Rules/Cost';
export declare const getRules: (
  playerGovernmentRegistry?: PlayerGovernmentRegistry,
  unitRegistry?: UnitRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => Cost[];
export default getRules;
