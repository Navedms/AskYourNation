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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const QuestionSchema = new mongoose_1.Schema({
    nation: {
        name: {
            type: String,
            required: true,
        },
        flag: {
            type: String,
        },
    },
    question: {
        type: String,
        required: true,
        maxLength: 200,
        unique: 1,
    },
    answers: {
        options: {
            type: [String],
            validate: (v) => Array.isArray(v) && v.length === 4,
        },
        correctIndex: {
            type: Number,
            required: true,
            select: false,
        },
    },
    rating: {
        value: {
            type: Number,
            min: 1,
            max: 5,
        },
        numberOfRatings: {
            type: Number,
            default: 0,
        },
        rank: {
            type: Number,
            default: 0,
        },
    },
    amountOfanswers: {
        correct: {
            type: Number,
            default: 0,
        },
        all: {
            type: Number,
            default: 0,
        },
    },
    createdBy: {
        id: {
            type: mongoose_1.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        firstName: { type: String, required: true, ref: "User" },
        lastName: { type: String, required: true, ref: "User" },
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Question", QuestionSchema);
