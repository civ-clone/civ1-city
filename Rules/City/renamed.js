"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const claimName_1 = require("@civ-clone/base-city-lifecycle/lib/claimName");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Renamed_1 = require("@civ-clone/core-city/Rules/Renamed");
/**
 * A city's new name is claimed, so that no city founded later is given it too (civ-clone/web-renderer#712, #876),
 * however the city came to be renamed: by its player, by another client or by a computer player. Its old name stays
 * taken, as a name in use once always has.
 */
const getRules = (cityNames) => [
    new Renamed_1.default(new Effect_1.default((city) => (0, claimName_1.claimName)(city, cityNames))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=renamed.js.map