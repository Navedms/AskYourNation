import Expo from "expo-server-sdk";

const sendPushNotification = async (
	pushToken: string,
	title: string,
	categoryId: string,
	message: string
): Promise<any> => {
	const expo = new Expo();
	const msgs = expo.chunkPushNotifications([
		{ to: pushToken, sound: "default", title, categoryId, body: message },
	]);

	const sendPushMsges = async () => {
		msgs.forEach(async (msg) => {
			try {
				const pushMsges = await expo.sendPushNotificationsAsync(msg);
				return pushMsges;
			} catch (error) {
				console.log("Error sending chunk", error);
				return false;
			}
		});
	};

	await sendPushMsges();
};

export default sendPushNotification;
