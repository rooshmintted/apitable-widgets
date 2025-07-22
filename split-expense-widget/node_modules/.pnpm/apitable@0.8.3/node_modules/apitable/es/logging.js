"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
function makeLogger(name) {
    return function (level, message, extraInfo) {
        console[level](name + " " + level + ":", message, extraInfo);
    };
}
exports.makeLogger = makeLogger;
