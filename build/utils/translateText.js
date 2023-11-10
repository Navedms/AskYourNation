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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguages = exports.translateText = void 0;
const translate_1 = require("@google-cloud/translate");
const translate = new translate_1.v2.Translate({
    credentials: {
        private_key: atob(`${process.env.GCS_FILE_PRIVATE_KEY}`),
        client_email: process.env.GCS_FILE_CLIENT_EMAIL,
        client_id: process.env.GCS_FILE_CLIENT_ID,
        universe_domain: process.env.GCS_FILE_UNIVERSE_DOMAIN,
    },
    projectId: process.env.GCS_PROJECT_ID,
});
const translateText = (text, language) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [response] = yield translate.translate(text, language);
        return response;
    }
    catch (error) {
        return {
            error: "Translation error: The requested text cannot be translated.",
        };
    }
});
exports.translateText = translateText;
const getLanguages = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [languages] = yield translate.getLanguages();
        return languages;
    }
    catch (error) {
        return {
            error: "Error: Unable to get the list of languages to translate",
        };
    }
});
exports.getLanguages = getLanguages;
