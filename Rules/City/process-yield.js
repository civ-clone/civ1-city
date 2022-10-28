"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Yields_1 = require("@civ-clone/civ1-world/Yields");
const Yields_2 = require("../../Yields");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const CivilDisorder_1 = require("@civ-clone/core-city-happiness/Rules/CivilDisorder");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const Unsupported_1 = require("@civ-clone/core-unit/Rules/Unsupported");
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    new ProcessYield_1.default(new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Food), new Effect_1.default((cityYield, city, cityYields) => {
        const cityGrowth = cityGrowthRegistry.getByCity(city), foodStorage = new Yields_2.FoodStorage(cityYield);
        cityYields.forEach((cityYield) => {
            if (!(cityYield instanceof Yields_2.UnitSupportFood) ||
                foodStorage.value() >= 0) {
                return;
            }
            const unit = cityYield.unit();
            if (unit === null) {
                return;
            }
            ruleRegistry.process(Unsupported_1.default, city, unit, cityYield);
            foodStorage.subtract(cityYield);
        });
        cityGrowth.add(foodStorage);
        cityGrowth.check();
    })),
    new ProcessYield_1.default(new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Effect_1.default((cityYield, city, cityYields) => {
        const cityBuild = cityBuildRegistry.getByCity(city), availableProduction = cityYield.clone();
        cityYields
            .filter((cityYield) => cityYield instanceof Yields_2.UnitSupportProduction)
            .sort((yieldA, yieldB) => {
            var _a, _b, _c, _d;
            return ((_b = (_a = yieldA.unit()) === null || _a === void 0 ? void 0 : _a.tile().distanceFrom(city.tile())) !== null && _b !== void 0 ? _b : 0) -
                ((_d = (_c = yieldB.unit()) === null || _c === void 0 ? void 0 : _c.tile().distanceFrom(city.tile())) !== null && _d !== void 0 ? _d : 0);
        })
            .forEach((cityYield) => {
            if (availableProduction.value() >= 0) {
                return;
            }
            const unit = cityYield.unit();
            if (unit === null) {
                return;
            }
            ruleRegistry.process(Unsupported_1.default, city, unit, cityYield);
            availableProduction.subtract(cityYield);
        });
        const updatedCityYields = city.yields();
        // No production happens when there's civil disorder.
        if (!ruleRegistry
            .get(CivilDisorder_1.default)
            .some((rule) => rule.validate(city, updatedCityYields))) {
            cityBuild.add(availableProduction);
        }
        cityBuild.check();
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=process-yield.js.map