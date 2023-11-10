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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const user_1 = __importDefault(require("../models/user"));
const auth_1 = require("../middleware/auth");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const generateVerificationCode_1 = __importDefault(require("../utils/generateVerificationCode"));
const uploadFiles_1 = require("../middleware/uploadFiles");
const translateText_1 = require("../utils/translateText");
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
        cb(null, true);
    }
    else {
        cb(new multer_1.default.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 1000000000, files: 1 },
});
// POST (Register and Login User)
// router.post("/test", async (req: Request, res: Response) => {
// 	console.log(req.body);
// 	res.json({
// 		test: true,
// 		msg: "Your test",
// 	});
// });
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (req.body.firstName) {
        req.body.type = "register";
    }
    else {
        req.body.type = "login";
    }
    // check if email already register (User)...
    const loginUser = yield user_1.default.findOne({ email: req.body.email });
    if (!loginUser && req.body.type === "login") {
        return res.status(400).json({
            error: "Email address does not exist. You must Sign Up first",
        });
    }
    if (!loginUser && req.body.type === "register") {
        const exsistName = yield user_1.default.find({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        });
        if (exsistName.length > 0) {
            return res.status(400).json({
                error: "This name is already taken, please choose another name",
            });
        }
        // add translated text in native languge
        if (((_a = req.body.nation) === null || _a === void 0 ? void 0 : _a.language) && ((_b = req.body.nation) === null || _b === void 0 ? void 0 : _b.language) !== "en") {
            const response = yield (0, translateText_1.translateText)("original text|translation", req.body.nation.language);
            if (typeof response === "string") {
                req.body.translate = {
                    original: response.split("|")[0],
                    translation: response.split("|")[1],
                };
            }
        }
        // register new user
        let user = new user_1.default(req.body);
        const doc = yield user.save();
        if (req.body.profilePic && doc) {
            yield user_1.default.findByIdAndUpdate(doc._id, { profilePic: req.body.profilePic }, {
                returnDocument: "after",
            });
        }
        // register new user and... send email to verify your email!
        doc.generateToken((err, doc) => {
            if (err)
                return res.status(400).send(err);
            user.token = doc.token;
        });
        if (req.body.verifiedEmail) {
            // Email is verify... check if user is active...
            if (!user.active)
                return res.status(403).json({
                    error: "This user has been removed and cannot be used",
                });
            // if is active... login!
            res.cookie("auth", user.token).send(user.token);
        }
        else {
            const message = `<p><b>Hello <strong>${user.firstName}</strong>, and welcome to AskYourNation!</b><br><br> Please click the link below to verify your email address:<br> ${process.env.SERVER_URL}/api/users/verify/${user._id}/${user.token}<br><br>Once your email address is verified, you can access your account in the app!<br><br>best regards,<br>AskYourNation App Team.</p>`;
            const result = yield (0, sendEmail_1.default)(user.email, "Verify Email in AskYourNation app", message);
            if (result) {
                res.json({
                    register: true,
                    message: "We have sent a message to your email address. Confirm your email address to finish registration.",
                });
            }
            else {
                return res.status(400).json({
                    error: "Failed to send registration link to your email address",
                });
            }
        }
    }
    else if (loginUser && req.body.type === "login") {
        if (req.body.verifiedEmail) {
            const user = yield user_1.default.findByIdAndUpdate(loginUser.id, { verifiedEmail: req.body.verifiedEmail }, {
                returnDocument: "after",
            });
            if (!user) {
                return res.status(400).json({
                    error: "Failed to Register Your Profile. Try again later.",
                });
            }
            user.generateToken((err, user) => {
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
        }
        else {
            // else compare passwords and make a login
            loginUser.comparePassword(req.body.password, (err, isMatch) => {
                if (err)
                    throw err;
                // if NOT send an Error
                if (!isMatch)
                    return res.status(400).json({
                        error: "The password is incorrect",
                    });
                // passwords is match!
                loginUser.generateToken((err, user) => {
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
        }
    }
    else if (loginUser && req.body.type === "register") {
        if (req.body.verifiedEmail) {
            const user = yield user_1.default.findByIdAndUpdate(loginUser.id, { verifiedEmail: req.body.verifiedEmail }, {
                returnDocument: "after",
            });
            if (!user) {
                return res.status(400).json({
                    error: "Failed to Register Your Profile. Try again later.",
                });
            }
            user.generateToken((err, user) => {
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
        }
        else {
            return res.status(400).json({
                error: "Email address already exists. It is not possible to register again with this email address",
            });
        }
    }
}));
// Verify Email
router.get("/verify/:id/:token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({ _id: req.params.id });
        if (!user)
            return res.status(400).send("Invalid link");
        if (!user.token)
            return res.status(400).send("Invalid link");
        yield user_1.default.findByIdAndUpdate(user._id, {
            verifiedEmail: true,
            token: null,
        });
        res.send(`<h2>Email verified sucessfully!</h2><p><br><br>Hello ${user.firstName}, your email address is now verified, you can access your account in the app!<br><br>best regards,<br>AskYourNation App Team.</p>`);
    }
    catch (error) {
        res.status(400).send(`An error occured. error: ${error}`);
    }
}));
//GET AND UPDATE (User personal profile)
//GET (User profile)
router.get("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const sort = req.query.sortBy
        ? `points.${req.query.sortBy}`
        : "points.total";
    const list = yield user_1.default.find({
        active: true,
        verifiedEmail: true,
        _id: { $ne: "64d893e184dc3ff40a2f0f62" },
    }).sort({
        [sort]: "desc",
        firstName: "asc",
    });
    const index = list.findIndex((x) => x._id.toString() === req.user._id.toString());
    res.json({
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profilePic: ((_c = req.user.profilePic) === null || _c === void 0 ? void 0 : _c.toString()) === "{}"
            ? undefined
            : req.user.profilePic,
        nation: req.user.nation,
        translate: req.user.translate,
        active: req.user.active,
        points: req.user.points,
        postQuestions: req.user.postQuestions,
        answeredQuestions: req.user.answeredQuestions,
        rank: index + 1,
        sounds: req.user.sounds,
        token: req.user.token,
    });
}));
router.get("/top-ten", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sort = req.query.sortBy
        ? `points.${req.query.sortBy}`
        : "points.total";
    const limit = req.query.limit || 10;
    const list = yield user_1.default.find({
        active: true,
        verifiedEmail: true,
        _id: { $ne: "64d893e184dc3ff40a2f0f62" },
    })
        .limit(limit)
        .sort({
        [sort]: "desc",
        firstName: "asc",
    });
    res.json({
        list: list.map((user) => {
            var _a;
            return {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePic: ((_a = user.profilePic) === null || _a === void 0 ? void 0 : _a.toString()) === "{}"
                    ? undefined
                    : user.profilePic,
                nation: user.nation,
                points: user.points,
            };
        }),
    });
}));
// PATCH
// User update profile
router.patch("/update", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        nation: req.body.nation,
    };
    const exsistName = yield user_1.default.find({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });
    if (exsistName.length > 0) {
        return res.status(400).json({
            error: "This name is already taken, please choose another name",
        });
    }
    const user = yield user_1.default.findByIdAndUpdate(req.body.id, profile, {
        returnDocument: "after",
    });
    if (!user) {
        return res.status(400).json({
            error: "Failed to Update Your Profile. Try again later.",
        });
    }
    res.json({
        success: true,
        msg: "Your profile has been successfully updated!",
        profile: user,
    });
}));
// User update profile v2
router.patch("/update/v2", [auth_1.auth, upload.array("file"), uploadFiles_1.upload], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = {};
    if (req.body.firstName)
        profile.firstName = req.body.firstName;
    if (req.body.lastName)
        profile.lastName = req.body.lastName;
    profile.nation = {
        name: req.body.nationName,
        flag: req.body.nationFlag,
        language: req.body.nationLanguage || "en",
    };
    if (req.images || req.body.deletProfilePic === "yes") {
        profile.profilePic =
            req.body.deletProfilePic === "yes" ? "" : req.images;
    }
    // update translated text in native languge
    if (req.body.nationLanguage && req.body.nationLanguage !== "en") {
        const response = yield (0, translateText_1.translateText)("Original text|Translation", req.body.nationLanguage);
        if (typeof response === "string") {
            profile.translate = {
                original: response.split("|")[0],
                translation: response.split("|")[1],
            };
        }
    }
    const exsistName = yield user_1.default.find({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        _id: { $ne: req.body.id },
    });
    if (exsistName.length > 0) {
        return res.status(400).json({
            error: "This name is already taken, please choose another name",
        });
    }
    const user = yield user_1.default.findByIdAndUpdate(req.body.id, profile, {
        returnDocument: "after",
    });
    if (!user) {
        return res.status(400).json({
            error: "Failed to Update Your Profile. Try again later.",
        });
    }
    res.json({
        success: true,
        msg: "Your profile has been successfully updated!",
        // profile: user,
    });
}));
// CHANGE PASSWORD
router.patch("/change-password", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginUser = yield user_1.default.findById(req.body.id);
    if (!loginUser) {
        return res.status(400).json({
            error: "The user does not exist",
        });
    }
    else {
        // else compare passwords...
        loginUser.comparePassword(req.body.oldPassword, (err, isMatch) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            // if NOT send an Error
            if (!isMatch)
                return res.status(400).json({
                    error: "Password cannot be changed, because you did not enter the correct password",
                });
            // if passwords is match.... change it!
            loginUser.password = req.body.newPassword;
            try {
                const doc = yield loginUser.save();
                if (!doc) {
                    return res.status(400).json({
                        error: "Failed to Update Your Profile. Try again later.",
                    });
                }
                res.json({
                    success: true,
                    msg: "Your password has been successfully changed!",
                });
            }
            catch (err) {
                return res.status(400).json({
                    error: `Failed to Update Your Profile. ${err}`,
                });
            }
        }));
    }
}));
// RESET PASSWORD
// step 1: send verification code to email
router.patch("/reset-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // check if email is in the system and valid (User)...
    const loginUser = yield user_1.default.findOne({ email: req.body.email });
    if (!loginUser)
        return res.status(400).json({
            error: "Your email address is incorrect",
        });
    if (!loginUser.active || !loginUser.verifiedEmail)
        return res.status(400).json({
            error: "Password cannot be reset for this user",
        });
    // generate verification code. sent it to the user email and store it in the DB.
    const pinCode = (0, generateVerificationCode_1.default)();
    loginUser.verificationCode = {
        code: pinCode,
        expired: new Date().getTime() + 5 * 60000,
    };
    try {
        yield loginUser.save();
        const message = `<p><b>Hello <strong>${loginUser.firstName}</strong>,</b><br>Your AskYourNation verification code is: <b>${pinCode}</b><br>Please enter this code in the app to reset your password.<br>This code is valid for 5 minutes.<br><br>best regards,<br>AskYourNation App Team.</p>`;
        const result = yield (0, sendEmail_1.default)(loginUser.email, "AskYourNation app reset password", message);
        if (result) {
            res.clearCookie("auth").json({
                register: true,
                message: "We have sent a verification code to your email address. This code is valid for 5 minutes.",
            });
        }
        else {
            return res.status(400).json({
                error: "Failed to send verification code to your email address",
            });
        }
    }
    catch (err) {
        return res.status(400).json({
            error: err,
        });
    }
}));
// step 2: enter verification code by the user.
router.patch("/verification-code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginUser = yield user_1.default.findOne({ email: req.body.email });
    if (!loginUser)
        return res.status(400).json({
            error: "Your email address is incorrect",
        });
    if (loginUser.verificationCode.expired < new Date().getTime() ||
        !loginUser.verificationCode.code)
        return res.status(400).json({
            error: "This verification code has expired",
        });
    loginUser.compareVerification(req.body.verificationCode, (err, isMatch) => __awaiter(void 0, void 0, void 0, function* () {
        if (err)
            throw err;
        // if NOT send an Error
        if (!isMatch)
            return res.status(400).json({
                error: "The verification code is incorrect",
            });
        // verification code is match!
        // delete verification code from DB
        yield user_1.default.findByIdAndUpdate(loginUser._id, {
            verificationCode: {
                code: null,
            },
        });
        loginUser.generateToken((err, user) => {
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
    }));
}));
// step 3: reset password by auth user and time expired.
router.patch("/change-password-after-reset", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginUser = yield user_1.default.findById(req.body.id);
    if (!loginUser)
        return res.status(400).json({
            error: "The user does not exist",
        });
    if (loginUser.verificationCode.expired < new Date().getTime())
        return res.status(400).json({
            error: "Verification code has expired, password change failed",
        });
    loginUser.password = req.body.newPassword;
    try {
        const doc = yield loginUser.save();
        if (!doc) {
            return res.status(400).json({
                error: "Failed to Update Your Profile. Try again later.",
            });
        }
        res.json({
            success: true,
            message: "Your password has been successfully changed!",
        });
    }
    catch (err) {
        return res.status(400).json({
            error: `Failed to Update Your Profile. ${err}`,
        });
    }
}));
router.patch("/sounds", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findByIdAndUpdate(req.query.id, {
        sounds: req.query.sounds,
    });
    if (!user) {
        return res.status(400).json({
            error: "Failed to update Your Profile. Try again later.",
        });
    }
    res.json({
        success: true,
        message: "Your profile has been successfully updated!",
    });
}));
// DELETE
// Delete user profile
router.delete("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findByIdAndUpdate(req.query.id, {
        active: false,
        token: null,
    });
    if (!user) {
        return res.status(400).json({
            error: "Failed to Delete Your Profile. Try again later.",
        });
    }
    res.json({
        success: true,
        message: "Your profile has been successfully deleted!",
    });
}));
exports.default = router;
