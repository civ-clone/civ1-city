"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const TileReassigned_1 = require("@civ-clone/core-city/Rules/TileReassigned");
const getRules = (ruleRegistry = RuleRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => {
    // The `WorkedTile` for `tile` if another `Player`'s `City` works it, other than as its centre: a `City` always works
    // its own centre, even while a `Unit` capturing it is moving in.
    const enemyWorkedTile = (unit, tile) => {
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
        new Moved_1.default('civ1-city:unit/moved/release-occupied-worked-tile', 
        // Released whether or not the `Unit` has moves left: one that stops here to fortify, sleep or wait still occupies
        // the `Tile`.
        new Criterion_1.default((unit, action) => enemyWorkedTile(unit, action.to()) !== null), new Effect_1.default((unit, action) => {
            // Every `Moved` rule's criteria are checked before any effect runs, and an earlier effect can move other units
            // onto the same `Tile`: a transport's cargo moves with it (`civ1-unit:unit/moved/move-cargo`), and its own
            // `Moved` rules release the `Tile` first (civ-clone/web-renderer#225). So it's looked up again here.
            const workedTile = enemyWorkedTile(unit, action.to());
            if (workedTile === null) {
                return;
            }
            workedTileRegistry.unregister(workedTile);
            ruleRegistry.process(TileReassigned_1.default, workedTile.city(), action.to());
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map