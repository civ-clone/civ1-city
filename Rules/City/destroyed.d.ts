import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
export declare const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  cityRegistry?: CityRegistry,
  engine?: Engine,
  unitRegistry?: UnitRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry
) => Destroyed[];
export default getRules;
