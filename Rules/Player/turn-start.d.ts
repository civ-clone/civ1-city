import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
export declare const getRules: (
  cityRegistry?: CityRegistry,
  unitRegistry?: UnitRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  ruleRegistry?: RuleRegistry
) => TurnStart[];
export default getRules;
