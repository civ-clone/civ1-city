"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defendersLosing = void 0;
/**
 * The defenders whose defeat is shrinking their city, while it does (`Rules/Unit/defeated`): a city of size 1 is
 * destroyed by it, before the attacker's win destroys the defender itself (`civ1-unit`'s
 * `unit/defeated/emit-and-destroy`, which runs after this package's rule). So `Rules/City/destroyed` leaves the defender
 * to that, and its loss is counted as the attacker's win, as v474.05's `battle` (`BATTLE.C`) drops the defender before
 * `vanish` (`CONTROL.C`) removes the city (civ-clone/web-renderer#969).
 */
exports.defendersLosing = new Set();
exports.default = exports.defendersLosing;
//# sourceMappingURL=defendersLosing.js.map