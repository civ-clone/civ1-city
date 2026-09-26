"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Specialists_1 = require("@civ-clone/library-city/Specialists");
const AvailableSpecialistRegistry_1 = require("@civ-clone/core-city/AvailableSpecialistRegistry");
// In the order a player cycles through them, starting with the kind a citizen becomes when taken off a tile.
AvailableSpecialistRegistry_1.instance.register(Specialists_1.Entertainer, Specialists_1.TaxCollector, Specialists_1.Scientist);
//# sourceMappingURL=registerAvailableSpecialists.js.map