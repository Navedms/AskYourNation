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
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
var user_1 = __importDefault(require("../models/user"));
var auth_1 = require("../middleware/auth");
var sendEmail_1 = __importDefault(require("../utils/sendEmail"));
var generateVerificationCode_1 = __importDefault(require("../utils/generateVerificationCode"));
// POST (Register and Login Admin and User)
router.post("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var loginUser, user, doc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.default.findOne({ email: req.body.email })];
            case 1:
                loginUser = _a.sent();
                if (!!loginUser) return [3 /*break*/, 3];
                user = new user_1.default(req.body);
                return [4 /*yield*/, user.save()];
            case 2:
                doc = _a.sent();
                // register new user and... send email to verify your email!
                doc.generateToken(function (err, user) {
                    if (err)
                        return res.status(400).send(err);
                    var message = "<p><b>Hello <strong>".concat(user.firstName, "</strong>, and welcome to AskYourNation!</b><br><br> Please click the link below to verify your email address:<br> ").concat(process.env.SERVER_URL, "/api/users/verify/").concat(user._id, "/").concat(user.token, "<br><br>Once your email address is verified, you can access your account in the app!<br><br>best regards,<br>AskYourNation App Team.</p>");
                    var sendRegistrationMail = function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, sendEmail_1.default)(user.email, "Verify Email in AskYourNation app", message)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); };
                    sendRegistrationMail();
                    res.json({
                        register: true,
                        message: "We have sent a message to your email address. Confirm your email address to finish registration.",
                    });
                });
                return [3 /*break*/, 4];
            case 3:
                // else compare passwords and make a login
                loginUser.comparePassword(req.body.password, function (err, isMatch) {
                    if (err)
                        throw err;
                    // if NOT send an Error
                    if (!isMatch)
                        return res.status(400).json({
                            error: "The password is incorrect",
                        });
                    // passwords is match!
                    loginUser.generateToken(function (err, user) {
                        if (err)
                            return res.status(400).send(err);
                        // check if Email is verify...
                        if (!user.verifiedEmail)
                            return res.status(401).json({
                                error: "Your email address has not been verified",
                            });
                        // if Email is verify... check if user is active...
                        if (!user.active)
                            return res.status(403).json({
                                error: "This user has been removed and cannot be used",
                            });
                        // if is active... login!
                        res.cookie("auth", user.token).send(user.token);
                    });
                });
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
// Verify Email
router.get("/verify/:id/:token", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, user_1.default.findOne({ _id: req.params.id })];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, res.status(400).send("Invalid link")];
                if (!user.token)
                    return [2 /*return*/, res.status(400).send("Invalid link")];
                return [4 /*yield*/, user_1.default.findByIdAndUpdate(user._id, {
                        verifiedEmail: true,
                        token: null,
                    })];
            case 2:
                _a.sent();
                res.send("<h2>Email verified sucessfully!</h2><p><br><br>Hello ".concat(user.firstName, ", your email address is now verified, you can access your account in the app!<br><br>best regards,<br>AskYourNation App Team.</p>"));
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                res.status(400).send("An error occured. error: ".concat(error_1));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
//GET AND UPDATE (User personal profile)
//GET (User profile)
router.get("/", auth_1.auth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sort, list, index;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                sort = req.query.sortBy
                    ? "points.".concat(req.query.sortBy)
                    : "points.total";
                return [4 /*yield*/, user_1.default.find({
                        active: true,
                        verifiedEmail: true,
                        _id: { $ne: "64d893e184dc3ff40a2f0f62" },
                    }).sort((_a = {},
                        _a[sort] = "desc",
                        _a))];
            case 1:
                list = _b.sent();
                index = list.findIndex(function (x) { return x._id.toString() === req.user._id.toString(); });
                res.json({
                    id: req.user._id,
                    email: req.user.email,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    nation: req.user.nation,
                    active: req.user.active,
                    points: req.user.points,
                    postQuestions: req.user.postQuestions,
                    answeredQuestions: req.user.answeredQuestions,
                    rank: index + 1,
                    sounds: req.user.sounds,
                    token: req.user.token,
                });
                return [2 /*return*/];
        }
    });
}); });
router.get("/top-ten", auth_1.auth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sort, limit, list;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                sort = req.query.sortBy
                    ? "points.".concat(req.query.sortBy)
                    : "points.total";
                limit = req.query.limit || 10;
                return [4 /*yield*/, user_1.default.find({
                        active: true,
                        verifiedEmail: true,
                        _id: { $ne: "64d893e184dc3ff40a2f0f62" },
                    })
                        .limit(limit)
                        .sort((_a = {},
                        _a[sort] = "desc",
                        _a))];
            case 1:
                list = _b.sent();
                res.json({
                    list: list.map(function (user) {
                        return {
                            id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            nation: user.nation,
                            points: user.points,
                        };
                    }),
                });
                return [2 /*return*/];
        }
    });
}); });
// PATCH
// User update profile
router.patch("/update", auth_1.auth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var profile, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                profile = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    nation: req.body.nation,
                };
                return [4 /*yield*/, user_1.default.findByIdAndUpdate(req.body.id, profile, {
                        returnDocument: "after",
                    })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Failed to Update Your Profile. Try again later.",
                        })];
                }
                res.json({
                    success: true,
                    msg: "Your profile has been successfully updated!",
                    profile: user,
                });
                return [2 /*return*/];
        }
    });
}); });
// CHANGE PASSWORD
router.patch("/change-password", auth_1.auth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var loginUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.default.findById(req.body.id)];
            case 1:
                loginUser = _a.sent();
                if (!loginUser) {
                    return [2 /*return*/, res.status(400).json({
                            error: "The user does not exist",
                        })];
                }
                else {
                    // else compare passwords...
                    loginUser.comparePassword(req.body.oldPassword, function (err, isMatch) { return __awaiter(void 0, void 0, void 0, function () {
                        var doc, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (err)
                                        throw err;
                                    // if NOT send an Error
                                    if (!isMatch)
                                        return [2 /*return*/, res.status(400).json({
                                                error: "Password cannot be changed, because you did not enter the correct password",
                                            })];
                                    // if passwords is match.... change it!
                                    loginUser.password = req.body.newPassword;
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, loginUser.save()];
                                case 2:
                                    doc = _a.sent();
                                    if (!doc) {
                                        return [2 /*return*/, res.status(400).json({
                                                error: "Failed to Update Your Profile. Try again later.",
                                            })];
                                    }
                                    res.json({
                                        success: true,
                                        msg: "Your password has been successfully changed!",
                                    });
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_1 = _a.sent();
                                    return [2 /*return*/, res.status(400).json({
                                            error: "Failed to Update Your Profile. ".concat(err_1),
                                        })];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                }
                return [2 /*return*/];
        }
    });
}); });
// RESET PASSWORD
// step 1: send verification code to email
router.patch("/reset-password", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var loginUser, pinCode, message_1, sendVerificationMail, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.default.findOne({ email: req.body.email })];
            case 1:
                loginUser = _a.sent();
                if (!loginUser)
                    return [2 /*return*/, res.status(400).json({
                            error: "Your email address is incorrect",
                        })];
                if (!loginUser.active || !loginUser.verifiedEmail)
                    return [2 /*return*/, res.status(400).json({
                            error: "Password cannot be reset for this user",
                        })];
                pinCode = (0, generateVerificationCode_1.default)();
                loginUser.verificationCode = {
                    code: pinCode,
                    expired: new Date().getTime() + 5 * 60000,
                };
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, loginUser.save()];
            case 3:
                _a.sent();
                message_1 = "<p><b>Hello <strong>".concat(loginUser.firstName, "</strong>,</b><br>Your AskYourNation verification code is: <b>").concat(pinCode, "</b><br>Please enter this code in the app to reset your password.<br>This code is valid for 5 minutes.<br><br>best regards,<br>AskYourNation App Team.</p>");
                sendVerificationMail = function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, sendEmail_1.default)(loginUser.email, "AskYourNation app reset password", message_1)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); };
                sendVerificationMail();
                res.clearCookie("auth").json({
                    register: true,
                    message: "We have sent a verification code to your email address. This code is valid for 5 minutes.",
                });
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                return [2 /*return*/, res.status(400).json({
                        error: err_2,
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// step 2: enter verification code by the user.
router.patch("/verification-code", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var loginUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.default.findOne({ email: req.body.email })];
            case 1:
                loginUser = _a.sent();
                if (!loginUser)
                    return [2 /*return*/, res.status(400).json({
                            error: "Your email address is incorrect",
                        })];
                if (loginUser.verificationCode.expired < new Date().getTime() ||
                    !loginUser.verificationCode.code)
                    return [2 /*return*/, res.status(400).json({
                            error: "This verification code has expired",
                        })];
                loginUser.compareVerification(req.body.verificationCode, function (err, isMatch) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err)
                                    throw err;
                                // if NOT send an Error
                                if (!isMatch)
                                    return [2 /*return*/, res.status(400).json({
                                            error: "The verification code is incorrect",
                                        })];
                                // verification code is match!
                                // delete verification code from DB
                                return [4 /*yield*/, user_1.default.findByIdAndUpdate(loginUser._id, {
                                        verificationCode: {
                                            code: null,
                                        },
                                    })];
                            case 1:
                                // verification code is match!
                                // delete verification code from DB
                                _a.sent();
                                loginUser.generateToken(function (err, user) {
                                    if (err)
                                        return res.status(400).send(err);
                                    // check if Email is verify...
                                    if (!user.verifiedEmail)
                                        return res.status(401).json({
                                            error: "Your email address has not been verified",
                                        });
                                    // if Email is verify... check if user is active...
                                    if (!user.active)
                                        return res.status(403).json({
                                            error: "This user has been removed and cannot be used",
                                        });
                                    // if is active... login!
                                    res.cookie("auth", user.token).json({
                                        verification: true,
                                        id: user._id,
                                        message: "Verification passed successfully. You must now reset your password.",
                                    });
                                });
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
// step 3: reset password by auth user and time expired.
router.patch("/change-password-after-reset", auth_1.auth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var loginUser, doc, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.default.findById(req.body.id)];
            case 1:
                loginUser = _a.sent();
                if (!loginUser)
                    return [2 /*return*/, res.status(400).json({
                            error: "The user does not exist",
                        })];
                if (loginUser.verificationCode.expired < new Date().getTime())
                    return [2 /*return*/, res.status(400).json({
                            error: "Verification code has expired, password change failed",
                        })];
                loginUser.password = req.body.newPassword;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, loginUser.save()];
            case 3:
                doc = _a.sent();
                if (!doc) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Failed to Update Your Profile. Try again later.",
                        })];
                }
                res.json({
                    success: true,
                    message: "Your password has been successfully changed!",
                });
                return [3 /*break*/, 5];
            case 4:
                err_3 = _a.sent();
                return [2 /*return*/, res.status(400).json({
                        error: "Failed to Update Your Profile. ".concat(err_3),
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.patch("/sounds", auth_1.auth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.default.findByIdAndUpdate(req.query.id, {
                    sounds: req.query.sounds,
                })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Failed to update Your Profile. Try again later.",
                        })];
                }
                res.json({
                    success: true,
                    message: "Your profile has been successfully updated!",
                });
                return [2 /*return*/];
        }
    });
}); });
// DELETE
// Delete user profile
router.delete("/", auth_1.auth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1.default.findByIdAndUpdate(req.query.id, {
                    active: false,
                    token: null,
                })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Failed to Delete Your Profile. Try again later.",
                        })];
                }
                res.json({
                    success: true,
                    message: "Your profile has been successfully deleted!",
                });
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
