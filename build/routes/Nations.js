"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var axios_1 = __importDefault(require("axios"));
var router = express_1.default.Router();
// GET
router.get('/', function (req, res) {
    axios_1.default
        .get('https://restcountries.com/v3.1/all')
        .then(function (response) {
        var data = response.data
            .map(function (item) {
            return { name: item.name.common, flag: item.flag };
        })
            .sort(function (a, b) {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        res.status(200).json({
            data: data,
        });
    })
        .catch(function (error) {
        res.status(400).send(error);
    });
});
exports.default = router;