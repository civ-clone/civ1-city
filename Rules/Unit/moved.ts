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
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import WorkedTile from '@civ-clone/core-city/WorkedTile';

export const getRules = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): Moved[] => {
  // The `WorkedTile` for `tile` if another `Player`'s `City` works it, other than as its centre: a `City` always works
  // its own centre, even while a `Unit` capturing it is moving in.
  const enemyWorkedTile = (unit: Unit, tile: Tile): WorkedTile | null => {
    const workedTile = workedTileRegistry.getByTile(tile);

    if (workedTile === null) {
      return null;
    }

    const city = workedTile.city();

    if (workedTile.tile() === city.tile() || city.player() === unit.player()) {
      return null;
    }

    return workedTile;
  };

  return [
    new Moved(
      'civ1-city:unit/moved/release-occupied-worked-tile',
      // Released whether or not the `Unit` has moves left: one that stops here to fortify, sleep or wait still occupies
      // the `Tile`.
      new Criterion(
        (unit: Unit, action: Action): boolean =>
          enemyWorkedTile(unit, action.to()) !== null
      ),
      new Effect((unit: Unit, action: Action): void => {
        // Every `Moved` rule's criteria are checked before any effect runs, and an earlier effect can move other units
        // onto the same `Tile`: a transport's cargo moves with it (`civ1-unit:unit/moved/move-cargo`), and its own
        // `Moved` rules release the `Tile` first (civ-clone/web-renderer#225). So it's looked up again here.
        const workedTile = enemyWorkedTile(unit, action.to());

        if (workedTile === null) {
          return;
        }

        workedTileRegistry.unregister(workedTile);

        ruleRegistry.process(TileReassigned, workedTile.city(), action.to());
      })
    ),
  ];
};

export default getRules;
