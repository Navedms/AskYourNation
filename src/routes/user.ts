import express, { Request, Response } from "express";
const router = express.Router();

import User from "../models/user";
import { auth } from "../middleware/auth";
import sendEmail from "../utils/sendEmail";
import generateVerificationCode from "../utils/generateVerificationCode";
import { log } from "console";

// POST (Register and Login Admin and User)

router.post("/", async (req: Request, res: Response) => {
	if (req.body.firstName && req.body.lastName) {
		req.body.type = "register";
	} else {
		req.body.type = "login";
	}

	// check if email already register (User)...
	const loginUser = await User.findOne({ email: req.body.email });
	if (!loginUser && req.body.type === "login") {
		return res.status(400).json({
			error: "Email address does not exist",
		});
	}
	if (!loginUser && req.body.type === "register") {
		const exsistName = await User.find({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
		});

		if (exsistName.length > 0) {
			return res.status(400).json({
				error: "This name is already taken, please choose another name",
			});
		}
		// register new user
		let user = new User(req.body);
		const doc = await user.save();

		// register new user and... send email to verify your email!

		doc.generateToken((err, doc) => {
			if (err) return res.status(400).send(err);
			user.token = doc.token;
		});
		const message = `<p><b>Hello <strong>${user.firstName}</strong>, and welcome to AskYourNation!</b><br><br> Please click the link below to verify your email address:<br> ${process.env.SERVER_URL}/api/users/verify/${user._id}/${user.token}<br><br>Once your email address is verified, you can access your account in the app!<br><br>best regards,<br>AskYourNation App Team.</p>`;
		const result = await sendEmail(
			user.email,
			"Verify Email in AskYourNation app",
			message
		);
		if (result) {
			res.json({
				register: true,
				message:
					"We have sent a message to your email address. Confirm your email address to finish registration.",
			});
		} else {
			return res.status(400).json({
				error: "Failed to send registration link to your email address",
			});
		}
	} else if (loginUser && req.body.type === "login") {
		// else compare passwords and make a login
		loginUser.comparePassword(req.body.password, (err, isMatch) => {
			if (err) throw err;
			// if NOT send an Error
			if (!isMatch)
				return res.status(400).json({
					error: "The password is incorrect",
				});
			// passwords is match!
			loginUser.generateToken((err, user) => {
				if (err) return res.status(400).send(err);
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
	} else if (loginUser && req.body.type === "register") {
		return res.status(400).json({
			error: "Email address already exists. It is not possible to register again with this email address",
		});
	}
});

// Verify Email

router.get("/verify/:id/:token", async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id });
		if (!user) return res.status(400).send("Invalid link");
		if (!user.token) return res.status(400).send("Invalid link");

		await User.findByIdAndUpdate(user._id, {
			verifiedEmail: true,
			token: null,
		});

		res.send(
			`<h2>Email verified sucessfully!</h2><p><br><br>Hello ${user.firstName}, your email address is now verified, you can access your account in the app!<br><br>best regards,<br>AskYourNation App Team.</p>`
		);
	} catch (error) {
		res.status(400).send(`An error occured. error: ${error}`);
	}
});

//GET AND UPDATE (User personal profile)

//GET (User profile)

router.get("/", auth, async (req: any, res: Response) => {
	const sort = req.query.sortBy
		? `points.${req.query.sortBy}`
		: "points.total";

	const list = await User.find({
		active: true,
		verifiedEmail: true,
		_id: { $ne: "64d893e184dc3ff40a2f0f62" },
	}).sort({
		[sort]: "desc",
	});

	const index = list.findIndex(
		(x) => x._id.toString() === req.user._id.toString()
	);

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
});

router.get("/top-ten", auth, async (req: any, res: Response) => {
	const sort = req.query.sortBy
		? `points.${req.query.sortBy}`
		: "points.total";
	const limit = req.query.limit || 10;
	const list = await User.find({
		active: true,
		verifiedEmail: true,
		_id: { $ne: "64d893e184dc3ff40a2f0f62" },
	})
		.limit(limit)
		.sort({
			[sort]: "desc",
		});
	res.json({
		list: list.map((user) => {
			return {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				nation: user.nation,
				points: user.points,
			};
		}),
	});
});

// PATCH

// User update profile

router.patch("/update", auth, async (req: any, res: Response) => {
	const profile: any = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		nation: req.body.nation,
	};
	const exsistName = await User.find({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
	});

	if (exsistName.length > 0) {
		return res.status(400).json({
			error: "This name is already taken, please choose another name",
		});
	}
	const user = await User.findByIdAndUpdate(req.body.id, profile, {
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
});

// CHANGE PASSWORD

router.patch("/change-password", auth, async (req: Request, res: Response) => {
	const loginUser = await User.findById(req.body.id);
	if (!loginUser) {
		return res.status(400).json({
			error: "The user does not exist",
		});
	} else {
		// else compare passwords...
		loginUser.comparePassword(
			req.body.oldPassword,
			async (err: Error, isMatch) => {
				if (err) throw err;
				// if NOT send an Error
				if (!isMatch)
					return res.status(400).json({
						error: "Password cannot be changed, because you did not enter the correct password",
					});
				// if passwords is match.... change it!
				loginUser.password = req.body.newPassword;
				try {
					const doc = await loginUser.save();
					if (!doc) {
						return res.status(400).json({
							error: "Failed to Update Your Profile. Try again later.",
						});
					}
					res.json({
						success: true,
						msg: "Your password has been successfully changed!",
					});
				} catch (err) {
					return res.status(400).json({
						error: `Failed to Update Your Profile. ${err}`,
					});
				}
			}
		);
	}
});

// RESET PASSWORD

// step 1: send verification code to email

router.patch("/reset-password", async (req: Request, res: Response) => {
	// check if email is in the system and valid (User)...
	const loginUser = await User.findOne({ email: req.body.email });

	if (!loginUser)
		return res.status(400).json({
			error: "Your email address is incorrect",
		});

	if (!loginUser.active || !loginUser.verifiedEmail)
		return res.status(400).json({
			error: "Password cannot be reset for this user",
		});

	// generate verification code. sent it to the user email and store it in the DB.
	const pinCode = generateVerificationCode();
	loginUser.verificationCode = {
		code: pinCode,
		expired: new Date().getTime() + 5 * 60000,
	};
	try {
		await loginUser.save();
		const message = `<p><b>Hello <strong>${loginUser.firstName}</strong>,</b><br>Your AskYourNation verification code is: <b>${pinCode}</b><br>Please enter this code in the app to reset your password.<br>This code is valid for 5 minutes.<br><br>best regards,<br>AskYourNation App Team.</p>`;

		const result = await sendEmail(
			loginUser.email,
			"AskYourNation app reset password",
			message
		);
		if (result) {
			res.clearCookie("auth").json({
				register: true,
				message:
					"We have sent a verification code to your email address. This code is valid for 5 minutes.",
			});
		} else {
			return res.status(400).json({
				error: "Failed to send verification code to your email address",
			});
		}
	} catch (err) {
		return res.status(400).json({
			error: err,
		});
	}
});

// step 2: enter verification code by the user.

router.patch("/verification-code", async (req: Request, res: Response) => {
	const loginUser = await User.findOne({ email: req.body.email });
	if (!loginUser)
		return res.status(400).json({
			error: "Your email address is incorrect",
		});
	if (
		loginUser.verificationCode.expired < new Date().getTime() ||
		!loginUser.verificationCode.code
	)
		return res.status(400).json({
			error: "This verification code has expired",
		});
	loginUser.compareVerification(
		req.body.verificationCode,
		async (err, isMatch) => {
			if (err) throw err;
			// if NOT send an Error
			if (!isMatch)
				return res.status(400).json({
					error: "The verification code is incorrect",
				});
			// verification code is match!
			// delete verification code from DB
			await User.findByIdAndUpdate(loginUser._id, {
				verificationCode: {
					code: null,
				},
			});
			loginUser.generateToken((err, user) => {
				if (err) return res.status(400).send(err);
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
					message:
						"Verification passed successfully. You must now reset your password.",
				});
			});
		}
	);
});

// step 3: reset password by auth user and time expired.

router.patch(
	"/change-password-after-reset",
	auth,
	async (req: Request, res: Response) => {
		const loginUser = await User.findById(req.body.id);
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
			const doc = await loginUser.save();
			if (!doc) {
				return res.status(400).json({
					error: "Failed to Update Your Profile. Try again later.",
				});
			}
			res.json({
				success: true,
				message: "Your password has been successfully changed!",
			});
		} catch (err) {
			return res.status(400).json({
				error: `Failed to Update Your Profile. ${err}`,
			});
		}
	}
);
router.patch("/sounds", auth, async (req: any, res: Response) => {
	const user = await User.findByIdAndUpdate(req.query.id, {
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
});

// DELETE

// Delete user profile

router.delete("/", auth, async (req: any, res: Response) => {
	const user = await User.findByIdAndUpdate(req.query.id, {
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
});

export default router;
