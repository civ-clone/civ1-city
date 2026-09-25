"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const PlayerActions_1 = require("@civ-clone/core-city-build/PlayerActions");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Action_1 = require("@civ-clone/core-player/Rules/Action");
const ChangeWorkedTile_1 = require("@civ-clone/core-city/PlayerActions/ChangeWorkedTile");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, cityRegistry = CityRegistry_1.instance) => {
    return [
        new Action_1.default('civ1-city:player/action/choose-production', new Criterion_1.default((player) => cityRegistry
            .getByPlayer(player)
            .map((city) => cityBuildRegistry.getByCity(city))
            .some((cityBuild) => !cityBuild.building())), new Effect_1.default((player) => cityRegistry
            .getByPlayer(player)
            .map((city) => cityBuildRegistry.getByCity(city))
            .filter((cityBuild) => !cityBuild.building())
            .map((cityBuild) => new PlayerActions_1.CityBuild(player, cityBuild)))),
        new Action_1.default('civ1-city:player/action/change-production', new Criterion_1.default((player) => cityRegistry
            .getByPlayer(player)
            .map((city) => cityBuildRegistry.getByCity(city))
            .some((cityBuild) => !!cityBuild.building())), new Effect_1.default((player) => cityRegistry
            .getByPlayer(player)
            .map((city) => cityBuildRegistry.getByCity(city))
            .filter((cityBuild) => !!cityBuild.building())
            .map((cityBuild) => new PlayerActions_1.ChangeProduction(player, cityBuild)))),
        new Action_1.default('civ1-city:player/action/change-worked-tile', new Criterion_1.default((player) => cityRegistry.getByPlayer(player).length > 0), new Effect_1.default((player) => cityRegistry
            .getByPlayer(player)
            .map((city) => new ChangeWorkedTile_1.default(player, city)))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map