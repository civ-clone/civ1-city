"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Actions_1 = require("@civ-clone/civ1-unit/Actions");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Defeated_1 = require("@civ-clone/core-unit/Rules/Defeated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (cityRegistry = CityRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    // After `civ1-unit`'s `unit/defeated/emit-and-destroy`, which is High: the attacker's win destroys the defender, and
    //  counts it as a loss, before the city shrinks, as v474.05's `battle` (`BATTLE.C`) drops the defender before `vanish`
    //  (`CONTROL.C`) removes a city of size 1 (civ-clone/web-renderer#1000). Not Low: other packages' `Defeated` rules
    //  (the computer player's, which may buy a defender for an empty city) should still see a city of size 1 gone.
    //  `civ1-unit`'s rule also announces the defeat (`unit:defeated`).
    new Defeated_1.default('civ1-city:unit/defeated/shrink-defended-city', new Criterion_1.default((defeated, by, action) => action instanceof Actions_1.Attack &&
        action.to() === defeated.tile() &&
        cityRegistry.getByTile(action.to()) !== null), new Effect_1.default((defeated, by, action) => {
        const city = cityRegistry.getByTile(defeated.tile());
        // Gone already, should an earlier rule have taken it.
        if (city === null) {
            return;
        }
        cityGrowthRegistry.getByCity(city).shrink(action);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=defeated.js.map