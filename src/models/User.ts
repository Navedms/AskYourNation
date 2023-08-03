import mongoose, { Document, Schema } from 'mongoose';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface Nation {
  name: string;
  flag: string;
}

export interface IUser {
  _id: Schema.Types.ObjectId;
  email: string;
  verifiedEmail: boolean;
  password: string;
  firstName: string;
  lastName: string;
  nation: Nation;
  active?: boolean;
  points?: number;
  postQuestions: Schema.Types.ObjectId[];
  answeredQuestions: Schema.Types.ObjectId[];
  token: string;
}

export interface IUserModel extends IUser {
  comparePassword(
    candidatePassword: string,
    cb: (err: Error, isMatch: boolean, valid: IUser) => void
  ): Promise<boolean>;
  generateToken(
    cd: (err: Error, user: IUser) => Response<any> | undefined
  ): Promise<string>;
  findByToken(
    token: string,
    cd: (err: Error, user: IUser) => Response<any> | undefined
  ): Promise<string>;
}

const SALT_I = 10;

const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: 1,
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    nation: {
      name: {
        type: String,
      },
      flag: {
        type: String,
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    postQuestions: {
      type: [Schema.Types.ObjectId],
    },
    answeredQuestions: {
      type: [Schema.Types.ObjectId],
    },
    token: {
      type: String,
    },
  },
  {
    versionKey: false,
  }
);

UserSchema.pre('save', function (next) {
  var user: any = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(SALT_I, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

UserSchema.methods.comparePassword = function (
  candidatePassword: string,
  cb: any
) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.methods.generateToken = async function (cb: any) {
  var loginUser: any = this;
  var newUser = {
    id: loginUser._id,
    email: loginUser.email,
  };
  var token = jwt.sign(
    JSON.parse(JSON.stringify(newUser)),
    config.secret.JWT_SECRET_KEY
  );

  loginUser.token = token;
  const user = await loginUser.save();
  cb(null, user);
};

UserSchema.statics.findByToken = function (token, cb) {
  const user = this;
  jwt.verify(
    token,
    config.secret.JWT_SECRET_KEY,
    async function (err: any, decode: any) {
      const loginUser = await user.findOne({ _id: decode.id, token: token });

      cb(null, loginUser);
    }
  );
};

export default mongoose.model<IUserModel>('User', UserSchema);
