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
    new Moved_1.default(new Criterion_1.default((unit) => unit.moves().value() === 0), new Criterion_1.default((unit, action) => workedTileRegistry.tileIsWorked(action.to())), new Criterion_1.default((unit, action) => {
        const workedTile = workedTileRegistry.getByTile(action.to());
        // If this isn't an enemy `Player` we don't care.
        if (workedTile.city().player() === unit.player()) {
            return false;
        }
        return !workedTileRegistry.tileCanBeWorkedBy(workedTile.tile(), workedTile.city());
    }), new Effect_1.default((unit, action) => {
        const workedTile = workedTileRegistry.getByTile(action.to());
        workedTileRegistry.unregister(workedTile);
        ruleRegistry.process(TileReassigned_1.default, workedTile.city(), action.to());
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map