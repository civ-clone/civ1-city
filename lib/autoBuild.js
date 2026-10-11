"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoBuild = exports.autoBuildable = void 0;
const autoBuild_1 = require("@civ-clone/core-city-build/lib/autoBuild");
const CityImprovement_1 = require("@civ-clone/core-city-improvement/CityImprovement");
// What a city on Auto may choose by itself: improvements and Wonders (which are improvements too), never units or
//  anything else a city can build, such as spaceship parts (civ-clone/web-renderer#194).
const autoBuildable = (buildItem) => Object.prototype.isPrototypeOf.call(CityImprovement_1.default, buildItem.item());
exports.autoBuildable = autoBuildable;
// Starts what a city on Auto that is building nothing needs most, of what it may choose by itself. Returns whether it
//  started anything.
const autoBuild = (cityBuild, ruleRegistry) => (0, autoBuild_1.autoBuild)(cityBuild, ruleRegistry, exports.autoBuildable);
exports.autoBuild = autoBuild;
exports.default = exports.autoBuild;
//# sourceMappingURL=autoBuild.js.map