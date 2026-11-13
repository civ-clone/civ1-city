import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  instance as workedTileRegistryInstance,
  WorkedTileRegistry,
} from '@civ-clone/core-city/WorkedTileRegistry';
import {
  enemyWorkedTile,
  releaseEnemyWorkedTile,
} from '@civ-clone/base-city-lifecycle/lib/occupiedTiles';
import Action from '@civ-clone/core-unit/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): Moved[] => [
  new Moved(
    'civ1-city:unit/moved/release-occupied-worked-tile',
    // Released whether or not the `Unit` has moves left: one that stops here to fortify, sleep or wait still occupies
    // the `Tile`.
    new Criterion(
      (unit: Unit, action: Action): boolean =>
        enemyWorkedTile(unit, action.to(), workedTileRegistry) !== null
    ),
    // Every `Moved` rule's criteria are checked before any effect runs, and an earlier effect can move other units onto
    // the same `Tile`: a transport's cargo moves with it (`civ1-unit:unit/moved/move-cargo`), and its own `Moved` rules
    // release the `Tile` first (civ-clone/web-renderer#225). So it's looked up again as it's released.
    new Effect((unit: Unit, action: Action): void => {
      releaseEnemyWorkedTile(
        unit,
        action.to(),
        workedTileRegistry,
        ruleRegistry
      );
    })
  ),
];

export default getRules;
