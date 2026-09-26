import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
export declare const getRules: (
  cityImprovementRegistry?: CityImprovementRegistry,
  playerGovernmentRegistry?: PlayerGovernmentRegistry,
  specialistRegistry?: SpecialistRegistry
) => YieldRule[];
export default getRules;
