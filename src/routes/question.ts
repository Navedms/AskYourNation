import express, { Request, Response } from 'express';
const router = express.Router();

import Question from '../models/question';
import User from '../models/user';
import { auth } from '../middleware/auth';
import { log } from 'console';
import sendEmail from '../utils/sendEmail';

// GET

// get 20 systematic questions again and again... untill end
router.get('/', auth, async (req: any, res: Response) => {
  const limit = req.query.limit || 20;
  const skip = req.query.skip || 0;

  const list = await Question.find({
    'createdBy.id': { $ne: req.user._id }, // filter questions that the user post
    _id: { $nin: req.user.answeredQuestions }, // filter questions that the user has already answered
  })
    .limit(limit)
    .skip(skip)
    .sort({
      'rating.rank': 'desc',
      createdAt: 'desc',
    });

  if (!list || list.length === 0) {
    return res.status(400).json({
      error: `There are no questions to display`,
    });
  }

  res.json({
    list: list,
  });
});

// get 20 my questions and load more... untill end.
router.get('/my-questions', auth, async (req: any, res: Response) => {
  const limit = req.query.limit || 20;
  const skip = req.query.skip || 0;

  const list = await Question.find({
    'createdBy.id': req.user._id,
  })
    .limit(limit)
    .skip(skip)
    .sort({
      createdAt: 'desc',
    });

  if (!list || list.length === 0) {
    return res.status(400).json({
      error: `There are no questions to display`,
    });
  }

  res.json({
    list: list,
  });
});

// POST (add new question)

router.post('/', auth, async (req: any, res: Response) => {
  const question = new Question(req.body);
  question.createdBy = {
    id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
  };
  try {
    const doc = await question.save();
    if (!doc) {
      return res.status(400).json({
        error: 'Posting the question failed',
      });
    }
    // update user DB
    await User.findByIdAndUpdate(req.user._id, {
      $push: { postQuestions: doc._id },
      $inc: { 'points.total': 1, 'points.questions': 1 },
    });
    res.json({
      success: true,
      msg: 'Your question has been successfully posted',
      question: doc,
    });
  } catch (error) {
    return res.status(400).json({
      error,
    });
  }
});

// PATCH

// update question
router.patch('/update', auth, async (req: any, res: Response) => {
  try {
    const question = await Question.findByIdAndUpdate(req.body.id, req.body, {
      returnDocument: 'after',
    });
    if (!question) {
      return res.status(400).json({
        error: 'Failed to Update Your question. Try again later.',
      });
    }
    res.json({
      success: true,
      msg: 'Your question has been successfully updated!',
      profile: question,
    });
  } catch (error) {
    return res.status(400).json({
      error,
    });
  }
});

// update qution rating
router.patch('/rating', auth, async (req: any, res: Response) => {
  try {
    if (req.body.rating > 5 || req.body.rating < 1) {
      return res.status(400).json({
        error: 'The rating must be between 1 and 5',
      });
    }
    const question = await Question.findById(req.body.id);
    if (!question) {
      return res.status(400).json({
        error: 'Failed to rating this question. Try again later.',
      });
    }

    const rating: number = question.rating.value
      ? question.rating.value +
        (Number(req.body.rating) - question.rating.value) /
          (question.rating.numberOfRatings + 1)
      : Number(req.body.rating);

    const newQuestion = await Question.findByIdAndUpdate(
      req.body.id,
      {
        'rating.value': rating,
        'rating.rank': rating * (question.rating.numberOfRatings + 1),
        $inc: { 'rating.numberOfRatings': 1 },
      },
      {
        returnDocument: 'after',
      }
    );
    if (!newQuestion) {
      return res.status(400).json({
        error: 'Failed to rating this question. Try again later.',
      });
    }

    res.json({
      success: true,
      msg: 'You have successfully rated this question!',
      rating: newQuestion.rating.value,
      numberOfRatings: newQuestion.rating.numberOfRatings,
      id: newQuestion._id,
    });
  } catch (error) {
    return res.status(400).json({
      error,
    });
  }
});

// report question
router.patch('/report', auth, async (req: any, res: Response) => {
  try {
    const question = await Question.findById(req.body.id);
    if (!question) {
      return res.status(400).json({
        error: 'Failed to report this question. It has already been deleted.',
      });
    }

    // add question id to the user answered list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { answeredQuestions: req.body.id },
    });

    // send email report

    const message = `<p><b>User report a question:</b><br><br><b>Details of the reporter:</b><br>Id: ${req.user._id}<br>FirstName: ${req.user.firstName}<br>LastName: ${req.user.lastName}<br><br><b>Question details:</b><br>Id: ${question._id}<br>Question: ${question.question}<br>Answers: ${question.answers.options}<br>Correct Answer Index: ${question.answers.correctIndex}<br>Created By:<br> - Id: ${question.createdBy.id}<br> - firstName: ${question.createdBy.firstName}<br> - lastName: ${question.createdBy.lastName}<br><br><b>The details of the report:</b><br>Reason: ${req.body.reason}<br><br>Free Text: ${req.body.text}</p>`;

    const sendVerificationMail = async () =>
      await sendEmail(
        process.env.EMAIL_USER as string,
        `User report a question: ${req.body.id} - AskYourNation app`,
        message
      );
    sendVerificationMail();

    res.json({
      success: true,
      msg: 'You have successfully reported this question!',
    });
  } catch (error) {
    return res.status(400).json({
      error,
    });
  }
});

// answer question

router.patch('/answer', auth, async (req: any, res: Response) => {
  try {
    const question = await Question.findById(req.body.id);
    if (!question) {
      return res.status(400).json({
        error: 'Failed to answer on this question. Try again later.',
      });
    }

    if (question.createdBy.id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'You cannot answer the questions you wrote.',
      });
    }

    if (req.user.answeredQuestions.includes(req.body.id)) {
      return res.status(400).json({
        error: 'You have already answered this question.',
      });
    }

    const userAnsweredCorrect =
      question.answers.correctIndex === req.body.answerIndex ? true : false;

    await Question.findByIdAndUpdate(req.body.id, {
      $inc: {
        'amountOfanswers.all': 1,
        'amountOfanswers.correct': userAnsweredCorrect ? 1 : 0,
      },
    });

    // update user DB
    await User.findByIdAndUpdate(req.user._id, {
      $push: { answeredQuestions: req.body.id },
      $inc: {
        'points.total': userAnsweredCorrect ? 1 : 0,
        'points.answers': userAnsweredCorrect ? 1 : 0,
      },
    });

    res.json({
      correctIndex: question.answers.correctIndex,
      userIndex: req.body.answerIndex,
      userAnsweredCorrect: userAnsweredCorrect,
    });
  } catch (error) {
    return res.status(400).json({
      error,
    });
  }
});

// Delete question

router.delete('/', auth, async (req: any, res: Response) => {
  // update user DB
  const question = await Question.findOneAndDelete({
    _id: req.query.id,
    'createdBy.id': req.user._id,
  });
  if (!question) {
    return res.status(400).json({
      error: 'Failed to Delete Your question. Try again later.',
    });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { postQuestions: req.query.id },
    $inc: { 'points.total': -1, 'points.questions': -1 },
  });

  res.json({
    success: true,
    msg: 'Your question has been successfully deleted!',
  });
});

export default router;
