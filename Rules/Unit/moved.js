"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const occupiedTiles_1 = require("@civ-clone/base-city-lifecycle/lib/occupiedTiles");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const getRules = (ruleRegistry = RuleRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => [
    new Moved_1.default('civ1-city:unit/moved/release-occupied-worked-tile', 
    // Released whether or not the `Unit` has moves left: one that stops here to fortify, sleep or wait still occupies
    // the `Tile`.
    new Criterion_1.default((unit, action) => (0, occupiedTiles_1.enemyWorkedTile)(unit, action.to(), workedTileRegistry) !== null), 
    // Every `Moved` rule's criteria are checked before any effect runs, and an earlier effect can move other units onto
    // the same `Tile`: a transport's cargo moves with it (`civ1-unit:unit/moved/move-cargo`), and its own `Moved` rules
    // release the `Tile` first (civ-clone/web-renderer#225). So it's looked up again as it's released.
    new Effect_1.default((unit, action) => {
        (0, occupiedTiles_1.releaseEnemyWorkedTile)(unit, action.to(), workedTileRegistry, ruleRegistry);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map