"use strict";
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
exports.upload = void 0;
const storage_1 = __importDefault(require("../utils/storage"));
const uuid_1 = require("uuid");
const upload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = req.files) === null || _a === void 0 ? void 0 : _a.length) === 0)
        return next();
    const bucket = storage_1.default.bucket(`${process.env.GCS_PROJECT_ID}`);
    req.files.map((file) => {
        const { originalname, buffer } = file;
        const blob = bucket.file(`${(0, uuid_1.v4)()}-${originalname.replace(/ /g, "_")}.png`);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });
        blobStream
            .on("finish", () => {
            blob.makePublic(function (err) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        return res.status(400).json({
                            error: `Error making file public: ${err}`,
                        });
                    }
                    else {
                        const publicUrl = blob.publicUrl();
                        req.images = publicUrl;
                        next();
                    }
                });
            });
        })
            .on("error", (err) => {
            return res.status(400).json({
                error: `Unable to upload image: ${err}`,
            });
        })
            .end(buffer);
    });
});
exports.upload = upload;
