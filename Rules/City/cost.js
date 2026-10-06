"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Types_1 = require("@civ-clone/civ1-unit/Types");
const Governments_1 = require("@civ-clone/civ1-government/Governments");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Cost_1 = require("@civ-clone/core-city/Rules/Cost");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const PopulationSupportFood_1 = require("@civ-clone/base-city-yield-population-support-food/PopulationSupportFood");
const Units_1 = require("@civ-clone/civ1-unit/Units");
const UnitSupportFood_1 = require("@civ-clone/base-city-yield-unit-support-food/UnitSupportFood");
const UnitSupportProduction_1 = require("@civ-clone/base-city-yield-unit-support-production/UnitSupportProduction");
// Diplomats and Caravans cost no shield under any government, and don't use up a free unit under Anarchy or Despotism
//  (v474.05: OpenCivOne `CityWorker.cs` L422-L430).
const supported = (unit) => [Types_1.Air, Types_1.Fortifiable, Types_1.Naval, Types_1.Worker].some((UnitType) => unit instanceof UnitType) && !(unit instanceof Types_1.Diplomatic);
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance, unitRegistry = UnitRegistry_1.instance) => [
    new Cost_1.default('civ1-city:city/cost/population-support-food', new Effect_1.default((city) => new PopulationSupportFood_1.default(cityGrowthRegistry.getByCity(city).size() * 2))),
    ...[
        [Units_1.Settlers, 1, Governments_1.Anarchy, Governments_1.Despotism],
        [Units_1.Settlers, 2, Governments_1.Communism, Governments_1.Democracy, Governments_1.Monarchy, Governments_1.Republic],
    ].map(([UnitType, cost, ...governments]) => new Cost_1.default(`civ1-city:city/cost/unit-support-food/${UnitType.name}/${cost}`, new Criterion_1.default((city) => unitRegistry
        .getByCity(city)
        .some((unit) => unit instanceof UnitType)), new Criterion_1.default((city) => playerGovernmentRegistry.getByPlayer(city.player()).is(...governments)), new Effect_1.default((city) => unitRegistry
        .getByCity(city)
        .filter((unit) => unit instanceof UnitType)
        .map((unit) => new UnitSupportFood_1.default(cost, unit))))),
    new Cost_1.default('civ1-city:city/cost/unit-support-production/anarchy-despotism', new Criterion_1.default((city) => playerGovernmentRegistry.getByPlayer(city.player()).is(Governments_1.Anarchy, Governments_1.Despotism)), new Criterion_1.default((city) => {
        const cityGrowth = cityGrowthRegistry.getByCity(city);
        return (unitRegistry.getByCity(city).filter(supported).length >
            cityGrowth.size());
    }), new Effect_1.default((city) => {
        const cityGrowth = cityGrowthRegistry.getByCity(city);
        return unitRegistry
            .getByCity(city)
            .filter(supported)
            .slice(cityGrowth.size())
            .map((unit) => new UnitSupportProduction_1.default(1, unit));
    })),
    new Cost_1.default('civ1-city:city/cost/unit-support-production/communism-democracy-monarchy-republic', new Criterion_1.default((city) => playerGovernmentRegistry
        .getByPlayer(city.player())
        .is(Governments_1.Communism, Governments_1.Democracy, Governments_1.Monarchy, Governments_1.Republic)), new Effect_1.default((city) => unitRegistry
        .getByCity(city)
        .filter(supported)
        .map((unit) => new UnitSupportProduction_1.default(1, unit)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=cost.js.map