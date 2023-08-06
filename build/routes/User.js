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
var User_1 = __importDefault(require("../models/User"));
// POST (Register and Login Admin and User)
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var loginUser, user, doc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User_1.default.findOne({ email: req.body.email })];
            case 1:
                loginUser = _a.sent();
                if (!!loginUser) return [3 /*break*/, 3];
                user = new User_1.default(req.body);
                return [4 /*yield*/, user.save()];
            case 2:
                doc = _a.sent();
                // register new user and... login!
                doc.generateToken(function (err, user) {
                    if (err)
                        return res.status(400).send(err);
                    res.cookie('auth', user.token).json({
                        register: true,
                        token: user.token,
                        id: user._id,
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
                            error: 'The password is incorrect',
                        });
                    // if passwords is match.... login!
                    loginUser.generateToken(function (err, user) {
                        if (err)
                            return res.status(400).send(err);
                        res.cookie('auth', user.token).send(user.token);
                    });
                });
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
// GET AND UPDATE (User personal profile)
// GET (User profile)
// router.get('/', auth, (req: any, res: Response) => {
//   res.json({
//     id: req.user._id,
//     email: req.user.email,
//     firstName: req.user.firstName,
//     lastName: req.user.lastName,
//     nation: req.user.nation,
//     active: req.user.active,
//     points: req.user.points,
//     postQuestions: req.user.postQuestions,
//     answeredQuestions: req.user.answeredQuestions,
//     token: req.user.token,
//   });
// });
router.get('/', function (req, res) {
    res.json({
        id: 'hello!',
    });
});
// UPDATE (User update profile)
// router.patch('/update', auth, async (req: any, res: Response) => {
//   const profile: any = {
//     id: req.body.id,
//     firstName: req.body.firstName,
//     lastName: req.body.lastName,
//     companyName: req.body.companyName,
//   };
//   if (req.images !== undefined && req.images.length > 0) {
//     profile.logoImg = req.images;
//     profile.images = req.images.map((fileName: string) => ({
//       fileName: fileName,
//     }));
//   }
//   if (req.body.deletlogoImg) {
//     profile.logoImg = '';
//   }
//   User.findByIdAndUpdate(req.body.id, profile, (err, doc) => {
//     if (err) return res.status(400).send(err);
//     if (!doc) {
//       return res.status(400).json({
//         error: translate('errors.user.update'),
//       });
//     }
//     res.json({
//       success: true,
//       msg: translate('success.user.update'),
//     });
//   });
// });
// // RESET PASSWORD (User reset password)
// router.post('/reset-password', auth, async (req: Request, res: Response) => {
//   User.findById(req.body.id, (err: Error, loginUser: UserModel) => {
//     if (err) throw err;
//     if (!loginUser) {
//       return res.status(400).json({
//         error: translate('errors.user.notExist'),
//       });
//     } else {
//       // else compare passwords and make a login
//       loginUser.comparePassword(req.body.oldPassword, (err: Error, isMatch) => {
//         if (err) throw err;
//         // if NOT send an Error
//         if (!isMatch)
//           return res.status(400).json({
//             error: translate('errors.user.password'),
//           });
//         // if passwords is match.... change it!
//         loginUser.password = req.body.newPassword;
//         loginUser.save((err, doc) => {
//           if (err) return res.status(400).send(err);
//           res.json({
//             success: true,
//             msg: translate('success.user.password.change'),
//           });
//         });
//       });
//     }
//   });
// });
exports.default = router;
