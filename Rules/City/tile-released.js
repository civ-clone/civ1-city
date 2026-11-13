"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TileReleased_1 = require("@civ-clone/core-city/Rules/TileReleased");
const events_1 = require("@civ-clone/base-city-lifecycle/lib/events");
const getRules = (engine = Engine_1.instance) => [
    // A client redraws the tile, which no longer shows the city working it (civ-clone/web-renderer#138).
    new TileReleased_1.default('civ1-city:city/tile-released/emit', new Effect_1.default((city, tile) => {
        (0, events_1.emitTileReleased)(city, tile, engine);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=tile-released.js.map