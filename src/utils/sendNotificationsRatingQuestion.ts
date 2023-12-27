import Expo from "expo-server-sdk";
import { Schema } from "mongoose";

import User from "../models/user";
import sendPushNotification from "./pushNotifications";

const sendNotificationsRatingQuestion = async (
	userId: Schema.Types.ObjectId,
	userName: string,
	ratingFirstName: string,
	ratingLastName: string,
	rating: number,
	question: string
) => {
	const user = await User.findById(userId);
	const pushToken = user?.pushToken;

	const notification = {
		title: "The question you wrote received a new rating!",
		categoryId: "MyQuestions",
		message: `Hello ${userName}, You received the rating ${rating} from ${ratingFirstName} ${ratingLastName} for the question: ${question}`,
	};

	if (Expo.isExpoPushToken(pushToken)) {
		await sendPushNotification(
			pushToken,
			notification.title,
			notification.categoryId,
			notification.message
		);
	}
};

export default sendNotificationsRatingQuestion;
