"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var mongoose_1 = __importDefault(require("mongoose"));
var config_1 = require("./config/config");
var Logging_1 = __importDefault(require("./library/Logging"));
// import authorRoutes from "./routes/Author";
// import bookRoutes from "./routes/Book";
var router = (0, express_1.default)();
// conect to mongoDB
mongoose_1.default
    .connect(config_1.config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(function () {
    Logging_1.default.info('connected to database');
    startServer();
})
    .catch(function (error) {
    Logging_1.default.error('unable to connect to database');
    Logging_1.default.error(error);
});
// start the server if mongo connected
var startServer = function () {
    router.use(function (req, res, next) {
        // log the Request
        Logging_1.default.info("Incomming -> Method: [".concat(req.method, "] - Url: [").concat(req.url, "] - IP: [").concat(req.socket.remoteAddress, "]"));
        res.on('finish', function () {
            Logging_1.default.info("Incomming -> Method: [".concat(req.method, "] - Url: [").concat(req.url, "] - IP: [").concat(req.socket.remoteAddress, "] - Status: [").concat(res.statusCode, "]"));
        });
        next();
    });
    router.use(express_1.default.urlencoded({ extended: true }));
    router.use(express_1.default.json());
    router.get('/', function (req, res) {
        res.send({ title: 'Books' });
    });
    // Routes
    // router.use('/nations', nationRoutes);
    // router.use('/users', userRoutes);
    // router.use('/questions', questionRoutes);
    // Error handling
    router.use(function (req, res, next) {
        var error = new Error('Not Found');
        Logging_1.default.error(error);
        return res.status(404).json({ message: error.message });
    });
    router.listen(config_1.config.server.port, function () {
        return Logging_1.default.info("Server listening on port ".concat(config_1.config.server.port));
    });
};
// api address:  https://naughty-newt-necklace.cyclic.cloud
