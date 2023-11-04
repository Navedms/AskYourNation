"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
// GET
router.get("/", (req, res) => {
    axios_1.default
        .get("https://restcountries.com/v3.1/all")
        .then(function (response) {
        const data = response.data
            .map((item) => {
            return {
                name: item.name.common,
                flag: item.flag,
                languages: item.languages,
            };
        })
            .sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        res.status(200).json({
            list: data,
        });
    })
        .catch(function (error) {
        res.status(400).send(error);
    });
});
exports.default = router;
