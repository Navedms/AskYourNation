import mongoose, { Schema } from "mongoose";
import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface Nation {
	name: string;
	flag: string;
	language?: string;
}

export interface Translate {
	original: string;
	translation: string;
	note: string;
}
export interface VerificationCode {
	code: string;
	expired: number;
}

export interface Points {
	total: number;
	questions: number;
	answers: number;
}

export interface IUser {
	_id: Schema.Types.ObjectId;
	email: string;
	verifiedEmail: boolean;
	password: string;
	firstName: string;
	lastName?: string;
	profilePic?: string;
	nation: Nation;
	translate: Translate;
	active?: boolean;
	sounds?: boolean;
	points?: Points;
	postQuestions: Schema.Types.ObjectId[];
	answeredQuestions: Schema.Types.ObjectId[];
	blockUsers: Schema.Types.ObjectId[];
	token: string;
	pushToken: string;
	lastActivity: Date;
	lastNotification: Date;
	verificationCode: VerificationCode;
}

export interface IUserModel extends IUser {
	comparePassword(
		candidatePassword: string,
		cb: (err: Error, isMatch: boolean, valid: IUser) => void
	): Promise<boolean>;
	compareVerification(
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
		lastName: { type: String },
		profilePic: {
			data: Buffer,
			contentType: String,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: 1,
		},
		verifiedEmail: {
			type: Boolean,
			default: false,
		},
		password: {
			type: String,
			minLength: 6,
		},
		nation: {
			name: {
				type: String,
			},
			flag: {
				type: String,
			},
			language: {
				type: String,
			},
		},
		translate: {
			original: {
				type: String,
				default: "Original text",
			},
			translation: {
				type: String,
				default: "Translation",
			},
			note: {
				type: String,
				default:
					"You can fill out the form in any language you choose. Please be careful not to mix multiple languages together. Our system will translate your question and save it in English.",
			},
		},
		active: {
			type: Boolean,
			default: true,
		},
		sounds: {
			type: Boolean,
			default: true,
		},
		points: {
			total: {
				type: Number,
				default: 0,
			},
			questions: {
				type: Number,
				default: 0,
			},
			answers: {
				type: Number,
				default: 0,
			},
		},
		postQuestions: {
			type: [Schema.Types.ObjectId],
		},
		answeredQuestions: {
			type: [Schema.Types.ObjectId],
		},
		blockUsers: {
			type: [Schema.Types.ObjectId],
		},
		token: {
			type: String,
		},
		pushToken: {
			type: String,
		},
		verificationCode: {
			code: {
				type: String,
			},
			expired: {
				type: Number,
			},
		},
		lastActivity: { type: Date },
		lastNotification: { type: Date, default: new Date() },
	},
	{
		versionKey: false,
	}
);

UserSchema.pre("save", function (next) {
	var user: any = this;
	if (user.isModified("password")) {
		bcrypt.genSalt(SALT_I, function (err, salt) {
			if (err) return next(err);

			bcrypt.hash(user.password, salt, function (err, hash) {
				if (err) return next(err);
				user.password = hash;
				next();
			});
		});
	} else if (user.isModified("verificationCode")) {
		bcrypt.genSalt(SALT_I, function (err, salt) {
			if (err) return next(err);
			bcrypt.hash(user.verificationCode.code, salt, function (err, hash) {
				if (err) return next(err);
				user.verificationCode.code = hash;

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

UserSchema.methods.compareVerification = function (
	candidateVerification: string,
	cb: any
) {
	bcrypt.compare(
		candidateVerification,
		this.verificationCode.code,
		function (err, isMatch) {
			if (err) return cb(err);
			cb(null, isMatch);
		}
	);
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
	loginUser.lastActivity = new Date();
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
			const loginUser = await user.findOneAndUpdate(
				{
					_id: decode.id,
					token: token,
				},
				{ lastActivity: new Date() }
			);

			cb(null, loginUser);
		}
	);
};

export default mongoose.model<IUserModel>("User", UserSchema);
