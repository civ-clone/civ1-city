"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Yields_1 = require("@civ-clone/civ1-world/Yields");
const Yields_2 = require("../../Yields");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, unitRegistry = UnitRegistry_1.instance) => [
    new ProcessYield_1.default(new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Food), new Effect_1.default((cityYield, city, cityYields) => {
        const cityGrowth = cityGrowthRegistry.getByCity(city), foodStorage = new Yields_2.FoodStorage(cityYield), foodSupportedUnits = [];
        cityYields.forEach((cityYield) => {
            if (cityYield instanceof Yields_2.UnitSupportFood) {
                foodStorage.subtract(cityYield);
                foodSupportedUnits.push(cityYield);
            }
            if (cityYield instanceof Yields_2.PopulationSupportFood) {
                foodStorage.subtract(cityYield);
            }
        });
        // This should probably be its own `Rule`
        while (foodStorage.value() < 0 && foodSupportedUnits.length > 0) {
            const foodSupportedUnit = foodSupportedUnits.shift(), unit = foodSupportedUnit.unit();
            // TODO: trigger a notification `UnsupportedUnit` - do the same for UnitSupportProduction.
            unit.destroy();
            foodStorage.add(foodSupportedUnit.value());
        }
        cityGrowth.add(foodStorage);
        cityGrowth.check();
    })),
    new ProcessYield_1.default(new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Effect_1.default((cityYield, city, cityYields) => cityYields.forEach((otherYield) => {
        if (otherYield instanceof Yields_2.UnitSupportProduction) {
            cityYield.subtract(otherYield);
        }
    }))),
    new ProcessYield_1.default(new Low_1.default(), new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Criterion_1.default((cityYield) => cityYield.value() >= 0), new Effect_1.default((cityYield, city) => {
        const cityBuild = cityBuildRegistry.getByCity(city);
        cityBuild.add(cityYield);
        cityBuild.check();
    })),
    new ProcessYield_1.default(new Low_1.default(), new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Criterion_1.default((cityYield) => cityYield.value() < 0), new Effect_1.default((cityYield, city) => {
        unitRegistry
            .getByCity(city)
            .sort((a, b) => a.tile().distanceFrom(city.tile()) -
            b.tile().distanceFrom(city.tile()))
            .slice(cityYield.value())
            // TODO: raise an event/Rule to listen for in the frontend `${city.name()} cannot support ${unit.constructor.name}`
            .forEach((unit) => unit.destroy());
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=process-yield.js.map