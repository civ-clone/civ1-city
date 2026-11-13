"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TileWorked_1 = require("@civ-clone/core-city/Rules/TileWorked");
const events_1 = require("@civ-clone/base-city-lifecycle/lib/events");
const getRules = (engine = Engine_1.instance) => [
    // A client redraws the tile, which shows who works it (civ-clone/web-renderer#138).
    new TileWorked_1.default('civ1-city:city/tile-worked/emit', new Effect_1.default((city, tile) => {
        (0, events_1.emitTileWorked)(city, tile, engine);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=tile-worked.js.map