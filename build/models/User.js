"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var config_1 = require("../config/config");
var SALT_I = 10;
var UserSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: 1,
    },
    verifiedEmail: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    nation: {
        name: {
            type: String,
        },
        flag: {
            type: String,
        },
    },
    active: {
        type: Boolean,
        default: true,
    },
    sounds: {
        type: Boolean,
        default: true,
    },
    points: {
        total: {
            type: Number,
            default: 0,
        },
        questions: {
            type: Number,
            default: 0,
        },
        answers: {
            type: Number,
            default: 0,
        },
    },
    postQuestions: {
        type: [mongoose_1.Schema.Types.ObjectId],
    },
    answeredQuestions: {
        type: [mongoose_1.Schema.Types.ObjectId],
    },
    token: {
        type: String,
    },
    verificationCode: {
        code: {
            type: String,
        },
        expired: {
            type: Number,
        },
    },
}, {
    versionKey: false,
});
UserSchema.pre("save", function (next) {
    var user = this;
    if (user.isModified("password")) {
        bcrypt_1.default.genSalt(SALT_I, function (err, salt) {
            if (err)
                return next(err);
            bcrypt_1.default.hash(user.password, salt, function (err, hash) {
                if (err)
                    return next(err);
                user.password = hash;
                next();
            });
        });
    }
    else if (user.isModified("verificationCode")) {
        bcrypt_1.default.genSalt(SALT_I, function (err, salt) {
            if (err)
                return next(err);
            bcrypt_1.default.hash(user.verificationCode.code, salt, function (err, hash) {
                if (err)
                    return next(err);
                user.verificationCode.code = hash;
                next();
            });
        });
    }
    else {
        next();
    }
});
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt_1.default.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err)
            return cb(err);
        cb(null, isMatch);
    });
};
UserSchema.methods.compareVerification = function (candidateVerification, cb) {
    bcrypt_1.default.compare(candidateVerification, this.verificationCode.code, function (err, isMatch) {
        if (err)
            return cb(err);
        cb(null, isMatch);
    });
};
UserSchema.methods.generateToken = function (cb) {
    return __awaiter(this, void 0, void 0, function () {
        var loginUser, newUser, token, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loginUser = this;
                    newUser = {
                        id: loginUser._id,
                        email: loginUser.email,
                    };
                    token = jsonwebtoken_1.default.sign(JSON.parse(JSON.stringify(newUser)), config_1.config.secret.JWT_SECRET_KEY);
                    loginUser.token = token;
                    return [4 /*yield*/, loginUser.save()];
                case 1:
                    user = _a.sent();
                    cb(null, user);
                    return [2 /*return*/];
            }
        });
    });
};
UserSchema.statics.findByToken = function (token, cb) {
    var user = this;
    jsonwebtoken_1.default.verify(token, config_1.config.secret.JWT_SECRET_KEY, function (err, decode) {
        return __awaiter(this, void 0, void 0, function () {
            var loginUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user.findOne({
                            _id: decode.id,
                            token: token,
                        })];
                    case 1:
                        loginUser = _a.sent();
                        cb(null, loginUser);
                        return [2 /*return*/];
                }
            });
        });
    });
};
exports.default = mongoose_1.default.model("User", UserSchema);
