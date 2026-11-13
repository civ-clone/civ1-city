"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const BuildingHeld_1 = require("@civ-clone/core-city-build/Rules/BuildingHeld");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const events_1 = require("@civ-clone/base-city-lifecycle/lib/events");
const getRules = (engine = Engine_1.instance) => [
    // A city's build is paid for and `Hold` rules keep it waiting: said each turn it waits, with the item and the ids of
    //  the rules holding it, for a client to word, and to tell its player of once (civ-clone/web-renderer#970).
    new BuildingHeld_1.default('civ1-city:city/building-held/emit', new Effect_1.default((cityBuild, item, held) => {
        (0, events_1.emitBuildingHeld)(cityBuild, item, held, engine);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=building-held.js.map