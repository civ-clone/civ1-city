import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import CanBeWorked from '@civ-clone/core-city/Rules/CanBeWorked';
export declare const getRules: (
  cityRegistry?: CityRegistry,
  unitRegistry?: UnitRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => CanBeWorked[];
export default getRules;
