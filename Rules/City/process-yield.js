"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CivilDisorder_1 = require("@civ-clone/core-city-happiness/Rules/CivilDisorder");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Yields_1 = require("@civ-clone/civ1-world/Yields");
const Yields_2 = require("../../Yields");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, engine = Engine_1.instance) => [
    new ProcessYield_1.default(new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Food), new Effect_1.default((cityYield, city, cityYields) => {
        const cityGrowth = cityGrowthRegistry.getByCity(city), foodStorage = new Yields_2.FoodStorage(cityYield), populationCost = (0, reduceYields_1.reduceYield)(cityYields, Yields_2.PopulationSupportFood);
        foodStorage.subtract(populationCost, Yields_2.PopulationSupportFood.name);
        if (foodStorage.value() < 0) {
            cityGrowth.empty();
            cityGrowth.shrink();
            engine.emit('city:food-storage-exhausted', city);
            // Recalculate these since they'll have changed
            cityYields = city.yields();
            foodStorage.set((0, reduceYields_1.reduceYield)(cityYields, Yields_1.Food) -
                (0, reduceYields_1.reduceYield)(cityYields, Yields_2.PopulationSupportFood), 'Shrink');
        }
        cityYields.forEach((cityYield) => {
            if (cityYield instanceof Yields_2.UnitSupportFood) {
                if (foodStorage.value() < cityYield.value()) {
                    const unit = cityYield.unit();
                    unit.destroy();
                    engine.emit('city:unit-unsupported', city, unit, cityYield);
                    return;
                }
                foodStorage.subtract(cityYield.value(), cityYield.unit().id());
            }
        });
        if (foodStorage.value() > 0) {
            cityGrowth.add(foodStorage);
            cityGrowth.check();
        }
    })),
    new ProcessYield_1.default(new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Effect_1.default((cityYield, city, cityYields) => cityYields.filter((otherYield) => otherYield instanceof Yields_2.UnitSupportProduction)
        // Remove units further away from the city if we're out of resources
        .sort((otherYieldA, otherYieldB) => otherYieldA.unit().tile().distanceFrom(city.tile()) -
        otherYieldB.unit().tile().distanceFrom(city.tile()))
        .forEach((otherYield) => {
        if (cityYield.value() < otherYield.value()) {
            const unit = otherYield.unit();
            unit.destroy();
            engine.emit('city:unit-unsupported', city, unit, otherYield);
            return;
        }
        cityYield.subtract(otherYield.value(), otherYield.unit().id());
    }))),
    new ProcessYield_1.default(new Low_1.default(), new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Criterion_1.default((cityYield, city, yields) => !ruleRegistry
        .get(CivilDisorder_1.CivilDisorder)
        .some((rule) => rule.validate(city, yields))), new Criterion_1.default((cityYield) => cityYield.value() >= 0), new Effect_1.default((cityYield, city) => {
        const cityBuild = cityBuildRegistry.getByCity(city);
        cityBuild.add(cityYield);
    })),
    new ProcessYield_1.default(new Low_1.default(), new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Effect_1.default((cityYield, city) => {
        const cityBuild = cityBuildRegistry.getByCity(city);
        cityBuild.check();
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=process-yield.js.map