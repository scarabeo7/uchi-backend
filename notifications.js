require("dotenv").config();
import cron from "node-cron";
import nodemailer from "nodemailer";

import { getAdminEmails } from "./utils/admin";
import { getSubmittedArtwork } from "./utils/artwork";

// Create email text
const createEmailText = async () => {
  const artwork = await getSubmittedArtwork();
  let html = `<!DOCTYPE html>
    <html><head>
	<style>
	table {
		font-family: Arial, Helvetica, sans-serif;
		border-collapse: collapse;
		width: 90%;
	}

	h1, table, div {
		margin: 20px;
	}

	table td, table th {
		border: 1px solid #ddd;
		padding: 8px;
	}

	table tr:nth-child(even){background-color: #f2f2f2;}

	table tr:hover {background-color: #ddd;}

	table th {
		padding-top: 12px;
		padding-bottom: 12px;
		text-align: left;
		background-color: #04AA6D;
		color: white;
	}
	</style>
	</head><header><h1>Here is the outstanding artwork to approve</h1></header>
	<body>`;
  if (artwork.length === 0) {
    html += "<div>No outstanding artwork to approve</div></body></html>";
  } else {
    html += `<table><thead><tr>
			<th>Artwork title</th>
			<th>Author name</th>
			<th>City</th>
			<th>Country</th>
			<th>Media type</th>
			<th>Submission date</th></tr></thead><tbody>`;
  }
  artwork.forEach((item) => {
    html += `<tr><td>${item.title}</td>
			<td>${item.artist_name}</td>
			<td>${item.city}</td>
			<td>${item.country}</td>
			<td>${item.content_type}</td>
			<td>${new Date(item.created_on).toLocaleDateString("en-GB")}</td></tr>`;
  });
  if (artwork.length > 0) {
    html += `</tbody></table><div>Go to <a href="https://uchi.world/login">login</a> to approve new submissions.</div></body></html>`;
  }
  return html;
};

const getMailOptions = async () => {
  const emails = await getAdminEmails();
  const htmlText = await createEmailText();
  return {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    bcc: emails,
    subject: "Uchi daily admin digest",
    html: htmlText,
  };
};

// Gmail settings for successful login: 2-factor auth off, allow less secure apps on
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email every day at 8am
//export const cronJob = cron.schedule("* * * * *", async () => {
export const cronJob = cron.schedule("0 8 * * *", async () => {
  if (process.env.MODE === "prod") {
    const mailOptions = await getMailOptions();
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
});
