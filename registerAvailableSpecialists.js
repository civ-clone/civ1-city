"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAvailableSpecialists = void 0;
const Specialists_1 = require("@civ-clone/library-city/Specialists");
/**
 * Offers the Civ1 specialists in `availableSpecialistRegistry`, in the order a player cycles through them, starting with
 * the kind a citizen becomes when taken off a tile. Kinds already there are left alone, so registering a game twice
 * doesn't add them twice.
 */
const registerAvailableSpecialists = (availableSpecialistRegistry) => availableSpecialistRegistry.register(...[Specialists_1.Entertainer, Specialists_1.TaxCollector, Specialists_1.Scientist].filter((SpecialistType) => !availableSpecialistRegistry.includes(SpecialistType)));
exports.registerAvailableSpecialists = registerAvailableSpecialists;
exports.default = exports.registerAvailableSpecialists;
//# sourceMappingURL=registerAvailableSpecialists.js.map