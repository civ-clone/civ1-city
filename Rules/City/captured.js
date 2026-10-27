"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const AvailableSpecialistRegistry_1 = require("@civ-clone/core-city/AvailableSpecialistRegistry");
const SpecialistRegistry_1 = require("@civ-clone/core-city/SpecialistRegistry");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const assignWorkers_1 = require("../../lib/assignWorkers");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, engine = Engine_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance) => [
    new Captured_1.default('civ1-city:city/captured/reset-build-progress', new Effect_1.default((capturedCity) => cityBuildRegistry.getByCity(capturedCity).progress().set(0))),
    new Captured_1.default(
    // Auto is the previous owner's standing order, not the city's (civ-clone/web-renderer#194).
    'civ1-city:city/captured/stop-auto', new Effect_1.default((capturedCity) => cityBuildRegistry.getByCity(capturedCity).setAuto(false))),
    new Captured_1.default(
    // What it was building was its previous owner's choice, at its previous owner's price: one its new owner may not
    //  be able to build, or want (civ-clone/web-renderer#670, #500). The new owner chooses. Civ1 keeps the item; this
    //  is a deliberate change. After `stop-auto`, so the `BuildingCancelled` rules don't choose for the city.
    'civ1-city:city/captured/clear-build', new Effect_1.default((capturedCity) => cityBuildRegistry.getByCity(capturedCity).cancel())),
    new Captured_1.default('civ1-city:city/captured/shrink', new Effect_1.default((capturedCity) => cityGrowthRegistry.getByCity(capturedCity).shrink(Captured_1.default))),
    new Captured_1.default('civ1-city:city/captured/emit', new Effect_1.default((capturedCity, capturingPlayer, player) => {
        engine.emit('city:captured', capturedCity, capturingPlayer, player);
    })),
    new Captured_1.default('civ1-city:city/captured/destroy-supported-units', 
    // Not the units now the capturer's, which defected with an incited city (civ-clone/web-renderer#58). After a
    //  conquest there are none.
    new Effect_1.default((capturedCity, capturingPlayer) => unitRegistry
        .getByCity(capturedCity)
        .filter((unit) => unit.player() !== capturingPlayer)
        .forEach((unit) => {
        // Not one the disbanding of another took with it already: when the city was its player's last, the first
        //  unit to go defeats the player, which destroys the rest (civ-clone/web-renderer#600).
        if (unit.destroyed()) {
            return;
        }
        unit.destroy();
    }))),
    new Captured_1.default('civ1-city:city/captured/reassign-workers', new Effect_1.default((capturedCity) => {
        // `shrink` above destroys a size 1 `City`, which releases its tiles, and assigning any now would leave them held
        // by a `City` that no longer exists. Checked here rather than as a `Criterion`: every `Criterion` is evaluated
        // before any `Effect` runs, so one would still see the `City` as it was before `shrink`.
        if (capturedCity.destroyed()) {
            return;
        }
        (0, assignWorkers_1.reassignWorkers)(capturedCity, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry, specialistRegistry, availableSpecialistRegistry);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map