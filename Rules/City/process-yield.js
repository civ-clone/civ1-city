"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Yields_1 = require("@civ-clone/civ1-world/Yields");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, unitRegistry = UnitRegistry_1.instance) => [
    new ProcessYield_1.default(new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Food), new Effect_1.default((cityYield, city) => {
        const cityGrowth = cityGrowthRegistry.getByCity(city);
        cityGrowth.add(cityYield);
        cityGrowth.check();
    })),
    new ProcessYield_1.default(new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Criterion_1.default((cityYield) => cityYield.value() >= 0), new Effect_1.default((cityYield, city) => {
        const cityBuild = cityBuildRegistry.getByCity(city);
        cityBuild.add(cityYield);
        cityBuild.check();
    })),
    new ProcessYield_1.default(new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Criterion_1.default((cityYield) => cityYield.value() < 0), new Effect_1.default((cityYield, city) => unitRegistry
        .getByCity(city)
        .sort((a, b) => a.tile().distanceFrom(city.tile()) -
        b.tile().distanceFrom(city.tile()))
        .slice(cityYield.value())
        .forEach((unit) => unit.destroy()))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=process-yield.js.map