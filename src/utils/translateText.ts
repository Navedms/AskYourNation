import { v2 } from "@google-cloud/translate";
import { log } from "console";

const translate = new v2.Translate({
	credentials: {
		private_key: atob(`${process.env.GCS_FILE_PRIVATE_KEY}`),
		client_email: process.env.GCS_FILE_CLIENT_EMAIL,
		client_id: process.env.GCS_FILE_CLIENT_ID,
		universe_domain: process.env.GCS_FILE_UNIVERSE_DOMAIN,
	},
	projectId: process.env.GCS_PROJECT_ID,
});

const translateText = async (text: string, language: string) => {
	try {
		const [response] = await translate.translate(text, language);
		return response;
	} catch (error) {
		return {
			error: "Translation error: The requested text cannot be translated.",
		};
	}
};

const getLanguages = async () => {
	try {
		const [languages] = await translate.getLanguages();
		return languages;
	} catch (error) {
		return {
			error: "Error: Unable to get the list of languages to translate",
		};
	}
};

export { translateText, getLanguages };
