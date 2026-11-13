"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const SpecialistRegistry_1 = require("@civ-clone/core-city/SpecialistRegistry");
const playerActions_1 = require("@civ-clone/base-city-lifecycle/lib/playerActions");
const Action_1 = require("@civ-clone/core-player/Rules/Action");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, cityRegistry = CityRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance) => {
    return [
        new Action_1.default('civ1-city:player/action/choose-production', new Criterion_1.default((player) => (0, playerActions_1.hasCityToChooseProduction)(player, cityRegistry, cityBuildRegistry)), new Effect_1.default((player) => (0, playerActions_1.chooseProductionActions)(player, cityRegistry, cityBuildRegistry))),
        new Action_1.default('civ1-city:player/action/change-production', new Criterion_1.default((player) => (0, playerActions_1.hasCityToChangeProduction)(player, cityRegistry, cityBuildRegistry)), new Effect_1.default((player) => (0, playerActions_1.changeProductionActions)(player, cityRegistry, cityBuildRegistry))),
        new Action_1.default('civ1-city:player/action/change-worked-tile', new Criterion_1.default((player) => (0, playerActions_1.hasCity)(player, cityRegistry)), new Effect_1.default((player) => (0, playerActions_1.changeWorkedTileActions)(player, cityRegistry))),
        new Action_1.default('civ1-city:player/action/change-specialist', new Criterion_1.default((player) => (0, playerActions_1.hasSpecialist)(player, cityRegistry, specialistRegistry)), new Effect_1.default((player) => (0, playerActions_1.changeSpecialistActions)(player, cityRegistry, specialistRegistry))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map