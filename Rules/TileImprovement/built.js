"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const Built_1 = require("@civ-clone/core-tile-improvement/Rules/Built");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const Removed_1 = require("@civ-clone/core-tile-improvement/Rules/Removed");
/**
 * A Fortress is never on a city's square (civ-clone/web-renderer#388). Settlers can't start one there, and founding a
 *  city takes one away (`Rules/City/created`), but one started before a city was founded on its square would still be
 *  finished: v474.05 checks for a city on each turn of the job (`CONTROL.C`, 'f', `map_flags & 0x21`) and stops it.
 *  Low, so it runs once civ1-world's `Built` rules have registered the Fortress, and takes it away through the
 *  `Removed` rules, so the renderer hears of it.
 */
const getRules = (cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance) => [
    new Built_1.default('civ1-city:tile-improvement/built/no-fortress-in-city', new Low_1.default(), new Criterion_1.default((tile, tileImprovement) => tileImprovement instanceof TileImprovements_1.Fortress), new Criterion_1.default((tile) => cityRegistry.getByTile(tile) !== null), 
    // Asked when it runs, not when the rules are picked: civ1-world's rule registers the Fortress first.
    new Effect_1.default((tile, tileImprovement) => {
        if (tileImprovementRegistry.getByTile(tile).includes(tileImprovement)) {
            ruleRegistry.process(Removed_1.default, tile, tileImprovement);
        }
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=built.js.map