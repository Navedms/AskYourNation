import Expo from "expo-server-sdk";

import User from "../models/user";
import sendPushNotification from "./pushNotifications";
import isDateGreaterDays from "./isDateGreaterDays";
import { Schema } from "mongoose";

const sendNotificationsNotWriteQuestion = async () => {
	const list = await User.find({
		active: true,
		verifiedEmail: true,
		"points.total": 0,
		_id: { $ne: "64d893e184dc3ff40a2f0f62" },
	});

	const ids: Schema.Types.ObjectId[] = [];
	list.forEach(async (user) => {
		if (
			isDateGreaterDays(user.lastNotification, new Date(), 3) ||
			!user.lastNotification
		) {
			const notification = {
				title: "Let's start playing!",
				categoryId: "QuestionAdd",
				message: `Hello ${user.firstName}, It's time to write a question, and start enjoying the game!`,
			};
			if (Expo.isExpoPushToken(user.pushToken)) {
				await sendPushNotification(
					user.pushToken,
					notification.title,
					notification.categoryId,
					notification.message
				);
			}
			ids.push(user._id);
		}
	});
	if (ids.length > 0) {
		await User.updateMany(
			{ _id: { $in: ids } },
			{ $set: { lastNotification: new Date() } }
		);
	}
};

export default sendNotificationsNotWriteQuestion;
