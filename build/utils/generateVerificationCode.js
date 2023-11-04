"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateVerificationCode = () => {
    return `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
};
exports.default = generateVerificationCode;
