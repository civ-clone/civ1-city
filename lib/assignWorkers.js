"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortTiles = exports.releaseCitizens = exports.reduceWorkers = exports.reassignWorkers = exports.getHighestValueCityTiles = exports.getHighestValueAvailableCityTiles = exports.citizenCount = exports.changeWorkedTile = exports.changeSpecialist = exports.assignWorkers = exports.assignWorker = exports.addSpecialist = void 0;
var assignWorkers_1 = require("@civ-clone/library-city/lib/assignWorkers");
Object.defineProperty(exports, "addSpecialist", { enumerable: true, get: function () { return assignWorkers_1.addSpecialist; } });
Object.defineProperty(exports, "assignWorker", { enumerable: true, get: function () { return assignWorkers_1.assignWorker; } });
Object.defineProperty(exports, "assignWorkers", { enumerable: true, get: function () { return assignWorkers_1.assignWorkers; } });
Object.defineProperty(exports, "changeSpecialist", { enumerable: true, get: function () { return assignWorkers_1.changeSpecialist; } });
Object.defineProperty(exports, "changeWorkedTile", { enumerable: true, get: function () { return assignWorkers_1.changeWorkedTile; } });
Object.defineProperty(exports, "citizenCount", { enumerable: true, get: function () { return assignWorkers_1.citizenCount; } });
Object.defineProperty(exports, "getHighestValueAvailableCityTiles", { enumerable: true, get: function () { return assignWorkers_1.getHighestValueAvailableCityTiles; } });
Object.defineProperty(exports, "getHighestValueCityTiles", { enumerable: true, get: function () { return assignWorkers_1.getHighestValueCityTiles; } });
Object.defineProperty(exports, "reassignWorkers", { enumerable: true, get: function () { return assignWorkers_1.reassignWorkers; } });
Object.defineProperty(exports, "reduceWorkers", { enumerable: true, get: function () { return assignWorkers_1.reduceWorkers; } });
Object.defineProperty(exports, "releaseCitizens", { enumerable: true, get: function () { return assignWorkers_1.releaseCitizens; } });
Object.defineProperty(exports, "sortTiles", { enumerable: true, get: function () { return assignWorkers_1.sortTiles; } });
const assignWorkers_2 = require("@civ-clone/library-city/lib/assignWorkers");
exports.default = assignWorkers_2.assignWorkers;
//# sourceMappingURL=assignWorkers.js.map