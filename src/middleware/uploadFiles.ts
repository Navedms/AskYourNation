import { Response, Request, NextFunction } from "express";
import storage from "../utils/storage";
import { v4 as uuid } from "uuid";
import { log } from "console";

const upload = async (req: Request, res: Response, next: NextFunction) => {
	if (req.files?.length === 0) return next();
	const bucket = storage.bucket(`${process.env.GCS_PROJECT_ID}`);

	(req.files as Express.Multer.File[]).map((file) => {
		const { originalname, buffer } = file;

		const blob = bucket.file(
			`${uuid()}-${originalname.replace(/ /g, "_")}.png`
		);
		const blobStream = blob.createWriteStream({
			resumable: false,
		});
		blobStream
			.on("finish", () => {
				blob.makePublic(async function (err) {
					if (err) {
						return res.status(400).json({
							error: `Error making file public: ${err}`,
						});
					} else {
						const publicUrl = blob.publicUrl();
						(req as any).images = publicUrl;
						next();
					}
				});
			})
			.on("error", (err) => {
				return res.status(400).json({
					error: `Unable to upload image: ${err}`,
				});
			})
			.end(buffer);
	});
};

export { upload };
