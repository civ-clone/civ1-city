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
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const capturedBuild_1 = require("../../lib/capturedBuild");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
const assignWorkers_1 = require("../../lib/assignWorkers");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const getRules = (cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, engine = Engine_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, clientRegistry = ClientRegistry_1.instance) => [
    new Captured_1.default(
    // As v474.05 (civd `CAPTURE.C` `capunit()`: `townbuf[b].shield_box = 0;`).
    'civ1-city:city/captured/reset-build-progress', new Effect_1.default((capturedCity) => cityBuildRegistry.getByCity(capturedCity).progress().set(0))),
    new Captured_1.default(
    // Auto is the previous owner's standing order, not the city's (civ-clone/web-renderer#194). As v474.05, whose
    //  `townbuf[b].status &= CITY_CAPTURE_MASK;` (0xae) clears `CITY_AUTO_BUILD` (0x10).
    'civ1-city:city/captured/stop-auto', new Effect_1.default((capturedCity) => cityBuildRegistry.getByCity(capturedCity).setAuto(false))),
    // v474.05 (civd `CAPTURE.C` `capunit()`, civ-clone/web-renderer#954) has a computer player that takes a city choose
    //  afresh, and the human keep the item, its shields gone (`townbuf[b].shield_box = 0;` above, `reset-build-progress`):
    //
    //      if (a == civnow) {
    //          city_process(b, 1L);
    //          sel_player();
    //      } else {
    //          townbuf[b].production = UTYPE_SETTLERS;
    //          townbuf[b].production = find_slot(a, b);
    //
    //  A new owner pays its own price for the item (`CITYMGT.C` `city_process()` sets `cost_scale` from the city's owner
    //  each turn).
    new Captured_1.default(
    // A computer player that takes a city chooses its build again, as `find_slot` does. After `stop-auto`, so the
    //  `BuildingCancelled` rules don't choose for the city.
    'civ1-city:city/captured/clear-build', new Criterion_1.default((capturedCity, capturingPlayer) => !(0, isHuman_1.default)(capturingPlayer, clientRegistry)), new Effect_1.default((capturedCity) => (0, capturedBuild_1.default)(cityBuildRegistry.getByCity(capturedCity)))),
    new Captured_1.default(
    // The human keeps what the city was building, at the human's price, and so may finish an item they could not
    //  choose (civ-clone/web-renderer#670). Asked for as a captured city's if nothing was being built
    //  (civ-clone/web-renderer#716). `civ1-enhanced` clears the build for the human too, taking this rule's place while
    //  its set is on.
    RuleIds_1.KEEP_BUILD_RULE, new Criterion_1.default((capturedCity, capturingPlayer) => (0, isHuman_1.default)(capturingPlayer, clientRegistry)), new Effect_1.default((capturedCity) => {
        const cityBuild = cityBuildRegistry.getByCity(capturedCity);
        if (cityBuild.building() === null) {
            cityBuild.setCleared('captured');
            return;
        }
        cityBuild.reprice();
    })),
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