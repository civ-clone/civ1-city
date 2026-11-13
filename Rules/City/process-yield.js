"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Yields_1 = require("../..//Yields");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const processYield_1 = require("@civ-clone/base-city-lifecycle/lib/processYield");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const Yields_2 = require("../../Yields");
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    new ProcessYield_1.default('civ1-city:city/process-yield/food', new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Food), 
    // The city's food, net of what its citizens and units eat, goes into its store, which may run out: a city short of
    //  food loses a unit it feeds (or a citizen) only when it does, not as soon as it is short (`FoodExhausted`,
    //  civ-clone/web-renderer#969).
    new Effect_1.default((cityYield, city) => {
        (0, processYield_1.storeFood)(cityYield, city, cityGrowthRegistry);
    })),
    new ProcessYield_1.default('civ1-city:city/process-yield/production', new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), 
    // Units the city can't support go, furthest first, and there's no production while there's civil disorder.
    new Effect_1.default((cityYield, city, cityYields) => {
        (0, processYield_1.buildWithProduction)(cityYield, city, cityYields, Yields_2.UnitSupportProduction, cityBuildRegistry, ruleRegistry);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=process-yield.js.map