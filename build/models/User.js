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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const SALT_I = 10;
const UserSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    profilePic: {
        data: Buffer,
        contentType: String,
    },
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
        minLength: 6,
    },
    nation: {
        name: {
            type: String,
        },
        flag: {
            type: String,
        },
        language: {
            type: String,
        },
    },
    translate: {
        original: {
            type: String,
            default: "Original text",
        },
        translation: {
            type: String,
            default: "Translation",
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
    blockUsers: {
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
    return __awaiter(this, void 0, void 0, function* () {
        var loginUser = this;
        var newUser = {
            id: loginUser._id,
            email: loginUser.email,
        };
        var token = jsonwebtoken_1.default.sign(JSON.parse(JSON.stringify(newUser)), config_1.config.secret.JWT_SECRET_KEY);
        loginUser.token = token;
        const user = yield loginUser.save();
        cb(null, user);
    });
};
UserSchema.statics.findByToken = function (token, cb) {
    const user = this;
    jsonwebtoken_1.default.verify(token, config_1.config.secret.JWT_SECRET_KEY, function (err, decode) {
        return __awaiter(this, void 0, void 0, function* () {
            const loginUser = yield user.findOne({
                _id: decode.id,
                token: token,
            });
            cb(null, loginUser);
        });
    });
};
exports.default = mongoose_1.default.model("User", UserSchema);
