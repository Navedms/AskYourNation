import mongoose, { Document, Schema } from 'mongoose';
import { Nation } from './User';

interface Answers {
  options: string[];
  correctIndex: 0 | 1 | 2 | 3;
}

interface CreatedBy {
  id: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
}

interface AmountOfanswers {
  all: number;
  correct: number;
}

export interface IQuestion {
  nation: Nation;
  question: string;
  answers: Answers;
  rating: number;
  numberOfRatings: number;
  amountOfanswers: AmountOfanswers;
  createdBy: CreatedBy;
}

export interface IQuestionModel extends IQuestion, Document {}

const QuestionSchema: Schema = new Schema(
  {
    nation: {
      name: {
        type: String,
      },
      flag: {
        type: String,
      },
    },
    question: {
      type: String,
      required: true,
    },
    answers: {
      options: {
        type: [String],
        validate: (v: string[]) => Array.isArray(v) && v.length === 4,
      },
      correctIndex: {
        type: Number,
        required: true,
      },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    numberOfRatings: {
      type: Number,
      default: 0,
    },
    amountOfanswers: {
      correct: {
        type: Number,
      },
      all: {
        type: Number,
      },
    },
    createdBy: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    },
    firstName: { type: String, required: true, ref: 'User' },
    lastName: { type: String, required: true, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQuestionModel>('Question', QuestionSchema);
