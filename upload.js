import db from "./db";
const { uploadFile, getFileStream } = require("./s3_upload");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const newQuery
  = "INSERT INTO artwork (title, artist_name, city, country, content_text, artwork_status, created_on, lat, lon, content_link, content_type ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)";

export const media = (req, res) => {
	const key = req.params.key;
	const readStream = getFileStream(key);

	readStream.pipe(res);
};

export const artUpload = async (req, res) => {
	const contentType = req.body.content_type;
	let contentLink = "";
	if (contentType !== "text") {
		const file = req.file;
		const result = await uploadFile(file);
		await unlinkFile(file.path);
		contentLink = result.Key;
		res.send({ imagePath: `/media/${result.Key}` });
	}
	const newArtTitle = req.body.title;
	const newArtName = req.body.artist_name;
	const newArtCity = req.body.city;
	const newArtCountry = req.body.country;
	const newArtStory = req.body.story;
	const newLat = req.body.lat;
	const newLon = req.body.lon;
	db.query(newQuery, [
		newArtTitle,
		newArtName,
		newArtCity,
		newArtCountry,
		newArtStory,
		"submitted",
		new Date(),
		newLat,
		newLon,
		contentLink,
		contentType,
	]).then(() => res.sendStatus(201));
};
