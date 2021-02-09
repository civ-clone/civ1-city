"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Governments_1 = require("@civ-clone/civ1-government/Governments");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Yields_1 = require("../../Yields");
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Cost_1 = require("@civ-clone/core-city/Rules/Cost");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Types_1 = require("@civ-clone/civ1-unit/Types");
const Units_1 = require("@civ-clone/civ1-unit/Units");
const getRules = (playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    new Cost_1.default(new Criterion_1.default((tileYield) => tileYield instanceof Yields_1.Food), new Effect_1.default((tileYield, city) => {
        const cityGrowth = cityGrowthRegistry.getByCity(city);
        tileYield.subtract(cityGrowth.size() * 2, 'population-cost');
    })),
    new Cost_1.default(new Criterion_1.default((tileYield) => tileYield instanceof Yields_1.Food), new Criterion_1.default((tileYield, city) => unitRegistry
        .getByCity(city)
        .some((unit) => unit instanceof Units_1.Settlers)), new Criterion_1.default((tileYield, city) => playerGovernmentRegistry.getByPlayer(city.player()).is(Governments_1.Anarchy, Governments_1.Despotism)), new Effect_1.default((tileYield, city) => tileYield.subtract(unitRegistry
        .getByCity(city)
        .filter((unit) => unit instanceof Units_1.Settlers).length, 'settlers-support'))),
    new Cost_1.default(new Criterion_1.default((tileYield) => tileYield instanceof Yields_1.Food), new Criterion_1.default((tileYield, city) => unitRegistry
        .getByCity(city)
        .some((unit) => unit instanceof Units_1.Settlers)), new Criterion_1.default((tileYield, city) => playerGovernmentRegistry
        .getByPlayer(city.player())
        .is(Governments_1.Communism, Governments_1.Democracy, Governments_1.Monarchy, Governments_1.Republic)), new Effect_1.default((tileYield, city) => tileYield.subtract(2 *
        unitRegistry
            .getByCity(city)
            .filter((unit) => unit instanceof Units_1.Settlers).length, 'settlers-support'))),
    new Cost_1.default(new Criterion_1.default((tileYield) => tileYield instanceof Yields_1.Production), new Criterion_1.default((tileYield, city) => playerGovernmentRegistry.getByPlayer(city.player()).is(Governments_1.Anarchy, Governments_1.Despotism)), new Criterion_1.default((tileYield, city) => {
        const cityGrowth = cityGrowthRegistry.getByCity(city);
        return (unitRegistry
            .getByCity(city)
            .filter((unit) => unit instanceof Types_1.Fortifiable).length >
            cityGrowth.size());
    }), new Effect_1.default((tileYield, city) => {
        const cityGrowth = cityGrowthRegistry.getByCity(city);
        tileYield.subtract(Math.abs(cityGrowth.size() -
            unitRegistry
                .getByCity(city)
                .filter((unit) => unit instanceof Types_1.Fortifiable)
                .length), 'unit-support');
    })),
    new Cost_1.default(new Criterion_1.default((tileYield) => tileYield instanceof Yields_1.Production), new Criterion_1.default((tileYield, city) => playerGovernmentRegistry
        .getByPlayer(city.player())
        .is(Governments_1.Communism, Governments_1.Democracy, Governments_1.Monarchy, Governments_1.Republic)), new Criterion_1.default((tileYield, city) => unitRegistry
        .getByCity(city)
        .some((unit) => unit instanceof Types_1.Fortifiable)), new Effect_1.default((tileYield, city) => tileYield.subtract(unitRegistry
        .getByCity(city)
        .filter((unit) => unit instanceof Types_1.Fortifiable).length, 'unit-support'))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=cost.js.map