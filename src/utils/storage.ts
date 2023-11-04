import { Storage } from "@google-cloud/storage";

const storage = new Storage({
	credentials: {
		private_key: atob(`${process.env.GCS_FILE_PRIVATE_KEY}`),
		client_email: process.env.GCS_FILE_CLIENT_EMAIL,
		client_id: process.env.GCS_FILE_CLIENT_ID,
		universe_domain: process.env.GCS_FILE_UNIVERSE_DOMAIN,
	},
	projectId: process.env.GCS_PROJECT_ID,
});

export default storage;
