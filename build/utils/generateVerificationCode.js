"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generateVerificationCode = function () {
    return "".concat(Math.floor(Math.random() * 10)).concat(Math.floor(Math.random() * 10)).concat(Math.floor(Math.random() * 10)).concat(Math.floor(Math.random() * 10)).concat(Math.floor(Math.random() * 10)).concat(Math.floor(Math.random() * 10));
};
exports.default = generateVerificationCode;
