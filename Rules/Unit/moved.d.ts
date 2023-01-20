import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import Moved from '@civ-clone/core-unit/Rules/Moved';
export declare const getRules: (
  ruleRegistry?: RuleRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => Moved[];
export default getRules;
