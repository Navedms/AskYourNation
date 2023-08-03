"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
var User_1 = __importDefault(require("../models/User"));
var auth = function (req, res, next) {
    var _a, _b;
    var token = ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.auth);
    if (!token) {
        return res.status(401).json({
            error: 'Access Denied',
        });
    }
    User_1.default.findByToken(token, function (err, user) {
        if (err)
            throw err;
        if (!user)
            return res.status(401).json({
                error: 'Access Denied',
            });
        if (!user.verifiedEmail)
            return res.status(401).json({
                error: 'Your email address has not been verified',
            });
        if (!user.active)
            return res.status(403).json({
                error: 'This user has been removed and cannot be used',
            });
        req.token = token;
        req.user = user;
        next();
    });
};
exports.auth = auth;
