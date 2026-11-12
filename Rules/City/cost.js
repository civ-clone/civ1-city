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
const unitSupport_1 = require("@civ-clone/base-government-unit-support/lib/unitSupport");
const government_1 = require("@civ-clone/base-government-unit-support/lib/government");
// Diplomats and Caravans cost no shield under any government, and don't use up a free unit under Anarchy or Despotism
//  (v474.05: OpenCivOne `CityWorker.cs` L422-L430).
const supported = (0, unitSupport_1.isSupportedBy)([Types_1.Air, Types_1.Fortifiable, Types_1.Naval, Types_1.Worker], [Types_1.Diplomatic]);
const getRules = (cityGrowthRegistry = CityGrowthRegistry_1.instance, playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance, unitRegistry = UnitRegistry_1.instance) => [
    new Cost_1.default('civ1-city:city/cost/population-support-food', new Effect_1.default((city) => new PopulationSupportFood_1.default(cityGrowthRegistry.getByCity(city).size() * 2))),
    ...[
        [Units_1.Settlers, 1, Governments_1.Anarchy, Governments_1.Despotism],
        [Units_1.Settlers, 2, Governments_1.Communism, Governments_1.Democracy, Governments_1.Monarchy, Governments_1.Republic],
    ].map(([UnitType, cost, ...governments]) => new Cost_1.default(`civ1-city:city/cost/unit-support-food/${UnitType.name}/${cost}`, new Criterion_1.default((city) => unitRegistry
        .getByCity(city)
        .some((unit) => unit instanceof UnitType)), new Criterion_1.default((city) => (0, government_1.isUnderGovernment)(city, governments, playerGovernmentRegistry)), new Effect_1.default((city) => (0, unitSupport_1.foodSupport)(unitRegistry.getByCity(city), (unit) => unit instanceof UnitType, cost)))),
    new Cost_1.default('civ1-city:city/cost/unit-support-production/anarchy-despotism', new Criterion_1.default((city) => (0, government_1.isUnderGovernment)(city, [Governments_1.Anarchy, Governments_1.Despotism], playerGovernmentRegistry)), 
    // As many units as the city has citizens are free.
    new Criterion_1.default((city) => (0, unitSupport_1.exceedsFreeSupport)(unitRegistry.getByCity(city), supported, cityGrowthRegistry.getByCity(city).size())), new Effect_1.default((city) => (0, unitSupport_1.productionSupport)(unitRegistry.getByCity(city), supported, cityGrowthRegistry.getByCity(city).size(), 1))),
    new Cost_1.default('civ1-city:city/cost/unit-support-production/communism-democracy-monarchy-republic', new Criterion_1.default((city) => (0, government_1.isUnderGovernment)(city, [Governments_1.Communism, Governments_1.Democracy, Governments_1.Monarchy, Governments_1.Republic], playerGovernmentRegistry)), new Effect_1.default((city) => (0, unitSupport_1.productionSupport)(unitRegistry.getByCity(city), supported, 0, 1))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=cost.js.map