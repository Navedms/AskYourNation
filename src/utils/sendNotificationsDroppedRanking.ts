import Expo from "expo-server-sdk";

import User from "../models/user";
import sendPushNotification from "./pushNotifications";
import numberOrdinal from "./numberOrdinal";
import { log } from "console";

const sendNotificationsDroppedRanking = async (id: string, rank: number) => {
	// chack if need send push notifications to users who just dropped in the ranking...

	const sort = "points.total";

	const list = await User.find({
		active: true,
		verifiedEmail: true,
		_id: { $ne: "64d893e184dc3ff40a2f0f62" },
	}).sort({
		[sort]: "desc",
		firstName: "asc",
	});

	const newRank =
		list.findIndex((x) => x._id.toString() === id.toString()) + 1;

	if (newRank < rank) {
		for (let i = newRank; i < rank; i++) {
			const { pushToken } = list[i];

			const notification = {
				title: "Oh no! Looks like you've been downgraded!",
				categoryId: "HighScores",
				message: `Hello ${
					list[i].firstName
				}, you dropped from ${numberOrdinal(
					i
				)} place to ${numberOrdinal(
					i + 1
				)} place. It's time to get back into the game and earn new points!`,
			};

			if (Expo.isExpoPushToken(pushToken)) {
				await sendPushNotification(
					pushToken,
					notification.title,
					notification.categoryId,
					notification.message
				);
			}
		}
	}
};

export default sendNotificationsDroppedRanking;
