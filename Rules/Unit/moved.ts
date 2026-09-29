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
    'civ1-city:unit/moved/release-occupied-worked-tile',
    new Criterion((unit: Unit, action: Action): boolean =>
      workedTileRegistry.tileIsWorked(action.to())
    ),
    new Criterion((unit: Unit, action: Action): boolean => {
      const workedTile = workedTileRegistry.getByTile(action.to())!,
        city = workedTile.city();

      // A `City` always works its own centre, even while a `Unit` capturing it is moving in.
      if (workedTile.tile() === city.tile()) {
        return false;
      }

      // Released whether or not the `Unit` has moves left: one that stops here to fortify, sleep or wait still occupies
      // the `Tile`.
      return city.player() !== unit.player();
    }),
    new Effect((unit: Unit, action: Action) => {
      const workedTile = workedTileRegistry.getByTile(action.to())!;

      workedTileRegistry.unregister(workedTile);

      ruleRegistry.process(TileReassigned, workedTile.city(), action.to());
    })
  ),
];

export default getRules;
