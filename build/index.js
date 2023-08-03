"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var mongoose_1 = __importDefault(require("mongoose"));
var config_1 = require("./config/config");
var Nations_1 = __importDefault(require("./routes/Nations"));
var User_1 = __importDefault(require("./routes/User"));
// import bookRoutes from "./routes/Book";
var router = (0, express_1.default)();
// conect to mongoDB
mongoose_1.default
    .connect(config_1.config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(function () {
    console.log('connected to database');
    startServer();
})
    .catch(function (error) {
    console.log('unable to connect to database');
    console.log(error);
});
// start the server if mongo connected
var startServer = function () {
    router.use(function (req, res, next) {
        // log the Request
        console.log("Incomming -> Method: [".concat(req.method, "] - Url: [").concat(req.url, "] - IP: [").concat(req.socket.remoteAddress, "]"));
        res.on('finish', function () {
            console.log("Incomming -> Method: [".concat(req.method, "] - Url: [").concat(req.url, "] - IP: [").concat(req.socket.remoteAddress, "] - Status: [").concat(res.statusCode, "]"));
        });
        next();
    });
    router.use(express_1.default.urlencoded({ extended: true }));
    router.use(express_1.default.json());
    router.use((0, cookie_parser_1.default)());
    // Routes
    router.use('/api/nations', Nations_1.default);
    router.use('/api/users', User_1.default);
    // router.use('/questions', questionRoutes);
    // Error handling
    router.use(function (req, res, next) {
        var error = new Error('Not Found');
        console.log(error);
        return res.status(404).json({ message: error.message });
    });
    router.listen(config_1.config.server.port, function () {
        return console.log("Server listening on port ".concat(config_1.config.server.port));
    });
};