"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var MONGO_URL = process.env.MONGO_URL;
var SERVER_PORT = process.env.SERVER_PORT || 1337;
exports.config = {
    mongo: {
        url: MONGO_URL || '',
    },
    server: {
        port: SERVER_PORT,
    },
    secret: {
        SECRET: process.env.SECRET || 'secrettt',
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'secret',
    },
};
