"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//钩子系统 会被server端程序调用 当
var Hooks = /** @class */ (function () {
    function Hooks() {
    }
    Hooks.prototype.unloaded = function (context) {
        throw new Error("Method not implemented.");
    };
    Hooks.prototype.install = function (context, installName) {
        throw new Error("Method not implemented.");
    };
    Hooks.prototype.uninstall = function (context, installName) {
        throw new Error("Method not implemented.");
    };
    Hooks.prototype.loaded = function (context) {
        console.log(context);
    };
    Hooks.prototype.generated = function (context) {
        console.log(context);
    };
    Hooks.prototype.articleChanged = function (context, type, dest) {
        throw new Error("Method not implemented.");
    };
    return Hooks;
}());
exports.default = new Hooks();
