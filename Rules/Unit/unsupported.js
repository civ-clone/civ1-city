"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Unsupported_1 = require("@civ-clone/core-unit/Rules/Unsupported");
const getRules = () => [
    new Unsupported_1.default(new Effect_1.default((city, unit) => unit.destroy())),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=unsupported.js.map