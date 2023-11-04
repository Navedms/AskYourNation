"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const nations_1 = __importDefault(require("./routes/nations"));
const user_1 = __importDefault(require("./routes/user"));
const question_1 = __importDefault(require("./routes/question"));
const router = (0, express_1.default)();
// conect to mongoDB
mongoose_1.default
    .connect(config_1.config.mongo.url, { retryWrites: true, w: "majority" })
    .then(() => {
    console.log("connected to database");
    startServer();
})
    .catch((error) => {
    console.log("unable to connect to database");
    console.log(error);
});
// start the server if mongo connected
const startServer = () => {
    router.use((req, res, next) => {
        // log the Request
        console.log(`Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        res.on("finish", () => {
            console.log(`Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
        });
        next();
    });
    router.use(express_1.default.urlencoded({ extended: true }));
    router.use(express_1.default.json());
    router.use((0, cookie_parser_1.default)());
    router.use(express_1.default.static("public"));
    // Routes
    router.use("/api/nations", nations_1.default);
    router.use("/api/users", user_1.default);
    router.use("/api/questions", question_1.default);
    // Error handling
    router.use((error, req, res, next) => {
        console.log("This is the rejected field ->", error.field);
    });
    router.use((req, res, next) => {
        const error = new Error("Not Found");
        console.log(error);
        return res.status(404).json({ message: error.message });
    });
    router.listen(config_1.config.server.port, () => console.log(`Server listening on port ${config_1.config.server.port}`));
};
