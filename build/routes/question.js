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
const router = express_1.default.Router();
const question_1 = __importDefault(require("../models/question"));
const user_1 = __importDefault(require("../models/user"));
const auth_1 = require("../middleware/auth");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
// GET
// get 20 systematic questions again and again... untill end
router.get("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = req.query.limit || 20;
    const skip = req.query.skip || 0;
    const list = yield question_1.default.find({
        "createdBy.id": { $ne: req.user._id, $nin: req.user.blockUsers },
        _id: { $nin: req.user.answeredQuestions }, // filter questions that the user has already answered
    })
        .limit(limit)
        .skip(skip)
        .sort({
        "rating.rank": "desc",
        createdAt: "desc",
    });
    if (!list || list.length === 0) {
        return res.status(400).json({
            error: `There are no questions to display`,
        });
    }
    res.json({
        list: list,
    });
}));
// get my questions.
router.get("/my-questions", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const list = yield question_1.default.find({
        "createdBy.id": req.user._id,
    })
        .select("+answers.correctIndex")
        .sort({
        createdAt: "desc",
    });
    if (!list || list.length === 0) {
        return res.status(400).json({
            error: `There are no questions to display`,
        });
    }
    res.json({
        list: list,
    });
}));
// POST (add new question)
router.post("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const question = new question_1.default(req.body);
    question.createdBy = {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
    };
    try {
        const doc = yield question.save();
        if (!doc) {
            return res.status(400).json({
                error: "Posting the question failed",
            });
        }
        // update user DB
        yield user_1.default.findByIdAndUpdate(req.user._id, {
            $push: { postQuestions: doc._id },
            $inc: { "points.total": 1, "points.questions": 1 },
        });
        res.json({
            success: true,
            msg: "Your question has been successfully posted",
            question: doc,
        });
    }
    catch (error) {
        return res.status(400).json({
            error,
        });
    }
}));
// PATCH
// update question
router.patch("/update", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = yield question_1.default.findByIdAndUpdate(req.body.id, req.body, {
            returnDocument: "after",
        });
        if (!question) {
            return res.status(400).json({
                error: "Failed to Update Your question. Try again later.",
            });
        }
        res.json({
            success: true,
            msg: "Your question has been successfully updated!",
            profile: question,
        });
    }
    catch (error) {
        return res.status(400).json({
            error,
        });
    }
}));
// update qution rating
router.patch("/rating", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.rating > 5 || req.body.rating < 1) {
            return res.status(400).json({
                error: "The rating must be between 1 and 5",
            });
        }
        const question = yield question_1.default.findById(req.body.id);
        if (!question) {
            return res.status(400).json({
                error: "Failed to rating this question. Try again later.",
            });
        }
        const rating = question.rating.value
            ? question.rating.value +
                (Number(req.body.rating) - question.rating.value) /
                    (question.rating.numberOfRatings + 1)
            : Number(req.body.rating);
        const newQuestion = yield question_1.default.findByIdAndUpdate(req.body.id, {
            "rating.value": rating,
            "rating.rank": rating * (question.rating.numberOfRatings + 1),
            $inc: { "rating.numberOfRatings": 1 },
        }, {
            returnDocument: "after",
        });
        if (!newQuestion) {
            return res.status(400).json({
                error: "Failed to rating this question. Try again later.",
            });
        }
        res.json({
            success: true,
            msg: "You have successfully rated this question!",
            rating: newQuestion.rating.value,
            numberOfRatings: newQuestion.rating.numberOfRatings,
            id: newQuestion._id,
        });
    }
    catch (error) {
        return res.status(400).json({
            error,
        });
    }
}));
// report question
router.patch("/report", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = yield question_1.default.findById(req.body.id).select("+answers.correctIndex");
        if (!question) {
            return res.status(400).json({
                error: "Failed to report this question. It has already been deleted.",
            });
        }
        // block user - add userId to IDs I dont want to see their questions
        if (req.body.blockUser) {
            yield user_1.default.findByIdAndUpdate(req.user._id, {
                $push: { blockUsers: question.createdBy.id },
            });
        }
        // send email report
        const message = `<p><b>User report a question:</b><br><br><b>Details of the reporter:</b><br>Id: ${req.user._id}<br>FirstName: ${req.user.firstName}<br>LastName: ${req.user.lastName}<br><br><b>Question details:</b><br>Id: ${question._id}<br>Question: ${question.question}<br>Answers: ${question.answers.options}<br>Correct Answer Index: ${question.answers.correctIndex}<br>Created By:<br> - Id: ${question.createdBy.id}<br> - firstName: ${question.createdBy.firstName}<br> - lastName: ${question.createdBy.lastName}<br><br><b>The details of the report:</b><br>Reason: ${req.body.reason}<br><br>Free Text: ${req.body.text}</p>`;
        const result = yield (0, sendEmail_1.default)(process.env.EMAIL_USER, `User report a question: ${req.body.id} - AskYourNation app`, message);
        if (result) {
            res.json({
                success: true,
                msg: req.body.blockUser
                    ? "You have successfully reported this question and block this user!"
                    : "You have successfully reported this question!",
            });
        }
        else {
            return res.status(400).json({
                error: "Failed to report this question.",
            });
        }
    }
    catch (error) {
        return res.status(400).json({
            error,
        });
    }
}));
// answer question
router.patch("/answer", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = yield question_1.default.findById(req.body.id).select("+answers.correctIndex");
        if (!question) {
            return res.status(400).json({
                error: "Failed to answer on this question. Try again later.",
            });
        }
        if (question.createdBy.id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                error: "You cannot answer the questions you wrote.",
            });
        }
        if (req.user.answeredQuestions.includes(req.body.id)) {
            return res.status(400).json({
                error: "You have already answered this question.",
            });
        }
        const userAnsweredCorrect = question.answers.correctIndex === req.body.answerIndex
            ? true
            : false;
        yield question_1.default.findByIdAndUpdate(req.body.id, {
            $inc: {
                "amountOfanswers.all": 1,
                "amountOfanswers.correct": userAnsweredCorrect ? 1 : 0,
            },
        });
        // update user DB
        yield user_1.default.findByIdAndUpdate(req.user._id, {
            $push: { answeredQuestions: req.body.id },
            $inc: {
                "points.total": userAnsweredCorrect ? 1 : 0,
                "points.answers": userAnsweredCorrect ? 1 : 0,
            },
        });
        res.json({
            correctIndex: question.answers.correctIndex,
            userIndex: req.body.answerIndex,
            userAnsweredCorrect: userAnsweredCorrect,
        });
    }
    catch (error) {
        return res.status(400).json({
            error,
        });
    }
}));
// Delete question
router.delete("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // update user DB
    const question = yield question_1.default.findOneAndDelete({
        _id: req.query.id,
        "createdBy.id": req.user._id,
    });
    if (!question) {
        return res.status(400).json({
            error: "Failed to Delete Your question. Try again later.",
        });
    }
    yield user_1.default.findByIdAndUpdate(req.user._id, {
        $pull: { postQuestions: req.query.id },
        $inc: { "points.total": -1, "points.questions": -1 },
    });
    res.json({
        success: true,
        id: req.query.id,
        msg: "Your question has been successfully deleted!",
    });
}));
exports.default = router;
