"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCapturedBuild = void 0;
/**
 * Clears what a captured city was building, so its new owner chooses: the item was its previous owner's choice, at
 * its previous owner's price (civ-clone/web-renderer#670, #500). The city is asked for as a captured city's even if
 * its previous owner had chosen nothing (civ-clone/web-renderer#716). Whichever rule decides that a captured city's
 * build is cleared clears it through this: this package's, for a computer player's capture, and any that takes the
 * place of `KEEP_BUILD_RULE` (civ-clone/web-renderer#954).
 */
const clearCapturedBuild = (cityBuild) => {
    if (cityBuild.building() === null) {
        cityBuild.setCleared('captured');
        return;
    }
    cityBuild.cancel('captured');
};
exports.clearCapturedBuild = clearCapturedBuild;
exports.default = exports.clearCapturedBuild;
//# sourceMappingURL=capturedBuild.js.map