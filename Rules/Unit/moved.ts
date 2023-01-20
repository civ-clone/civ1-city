import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  instance as workedTileRegistryInstance,
  WorkedTileRegistry,
} from '@civ-clone/core-city/WorkedTileRegistry';
import Action from '@civ-clone/core-unit/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): Moved[] => [
  new Moved(
    new Criterion((unit: Unit): boolean => unit.moves().value() === 0),
    new Criterion((unit: Unit, action: Action): boolean =>
      workedTileRegistry.tileIsWorked(action.to())
    ),
    new Criterion((unit: Unit, action: Action): boolean => {
      const workedTile = workedTileRegistry.getByTile(action.to())!;

      // If this isn't an enemy `Player` we don't care.
      if (workedTile.city().player() === unit.player()) {
        return false;
      }

      return !workedTileRegistry.tileCanBeWorkedBy(
        workedTile.tile(),
        workedTile.city()
      );
    }),
    new Effect((unit: Unit, action: Action) => {
      const workedTile = workedTileRegistry.getByTile(action.to())!;

      workedTileRegistry.unregister(workedTile);

      ruleRegistry.process(TileReassigned, workedTile.city(), action.to());
    })
  ),
];

export default getRules;
