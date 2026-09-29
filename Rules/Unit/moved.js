"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const TileReassigned_1 = require("@civ-clone/core-city/Rules/TileReassigned");
const getRules = (ruleRegistry = RuleRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => [
    new Moved_1.default('civ1-city:unit/moved/release-occupied-worked-tile', new Criterion_1.default((unit, action) => workedTileRegistry.tileIsWorked(action.to())), new Criterion_1.default((unit, action) => {
        const workedTile = workedTileRegistry.getByTile(action.to()), city = workedTile.city();
        // A `City` always works its own centre, even while a `Unit` capturing it is moving in.
        if (workedTile.tile() === city.tile()) {
            return false;
        }
        // Released whether or not the `Unit` has moves left: one that stops here to fortify, sleep or wait still occupies
        // the `Tile`.
        return city.player() !== unit.player();
    }), new Effect_1.default((unit, action) => {
        const workedTile = workedTileRegistry.getByTile(action.to());
        workedTileRegistry.unregister(workedTile);
        ruleRegistry.process(TileReassigned_1.default, workedTile.city(), action.to());
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map