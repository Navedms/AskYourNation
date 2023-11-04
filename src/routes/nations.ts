import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

// GET

router.get("/", (req: Request, res: Response) => {
	axios
		.get("https://restcountries.com/v3.1/all")
		.then(function (response) {
			const data = response.data
				.map((item: any) => {
					return {
						name: item.name.common,
						flag: item.flag,
						languages: item.languages,
					};
				})
				.sort((a: any, b: any) => {
					if (a.name < b.name) {
						return -1;
					}
					if (a.name > b.name) {
						return 1;
					}
					return 0;
				});
			res.status(200).json({
				list: data,
			});
		})
		.catch(function (error) {
			res.status(400).send(error);
		});
});

export default router;
