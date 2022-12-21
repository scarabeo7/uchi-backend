require("dotenv").config();
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { getAdminEmails, getUserDetails } from "./utils/admin";
import db from "./db";

export const login = (req, res) => {
  const { user } = req;
  res.json(user);
};

export const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    req.logout();
    res.sendStatus(200);
  });
};

export const ping = (req, res) => {
  const { user } = req;
  res.send(user);
};

export const requestReset = async (req, res) => {
  const email = req.body.email;
  const adminEmails = await getAdminEmails();
  if (adminEmails.includes(email)) {
    const userDetails = await getUserDetails(email, "email");
    const salt = bcrypt.genSaltSync();
    const token =
      userDetails.email + userDetails.pass + new Date().toLocaleDateString();
    const hash = bcrypt.hashSync(token, salt);
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Uchi password reset link",
      html: `Someone requested a password reset for this Uchi account. If it wasn't you, no need to do anything. If you required a password reset, 
				go to <a href="https://uchi.world/reset?id=${userDetails.id}&token=${hash}">
				https://uchi.world/reset?id=${userDetails.id}&token=${hash}</a> to reset your password. This link is only valid for today.`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
  res.send("request processed");
};

export const verifyToken = async (req, res) => {
  const id = req.query.id;
  const token = req.query.token;
  const type = req.query.type;
  const userDetails = await getUserDetails(id, "id");
  let newToken;
  if (type === "newaccount" && userDetails.pass === null) {
	  newToken = userDetails.email + new Date().toLocaleDateString();
  } else {
	  newToken = userDetails.email + userDetails.pass + new Date().toLocaleDateString();
  }
  console.log(userDetails.pass)
  bcrypt.compare(newToken, token, (err, result) => {
    // res == true or res == false
    if (err) return res.status(500).send("could not complete password reset");
    if (result) return res.send("Correct info");
    return res.status(401).send("Incorrect info");
  });
};

export const resetPassword = async (req, res) => {
  const id = req.params.id;
  const newPassword = req.body.pass;
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(newPassword, salt);
  const updateQuery = `UPDATE admins SET pass='${hash}' WHERE id=$1;`;
  try {
    const queryResult = await db.query(updateQuery, [id]);
    if (queryResult.rowCount === 1) {
      return res.sendStatus(200);
    } else {
      return res.sendStatus(500);
    }
  } catch {
    (error) => res.status(500).send(error);
  }
};

export const createNewAdmin = async (req, res) => { 
  const username = req.body.username;
  const email = req.body.email;
  const adminEmails = await getAdminEmails();
  const usernameExists = await getUserDetails(username, "username");
  if (adminEmails.includes(email)  || usernameExists !== undefined ) return res.sendStatus(400)
  const createQuery = `INSERT INTO admins (username, email) VALUES ($1, $2);`;
  try {
    const queryResult = await db.query(createQuery, [username, email]);
    if (queryResult.rowCount === 1) {
      const userDetails = await getUserDetails(email, "email");
      const salt = bcrypt.genSaltSync();
      const token = userDetails.email + new Date().toLocaleDateString();
      const hash = bcrypt.hashSync(token, salt);
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Uchi account created",
        html: `Someone created an account for you on Uchi with username ${userDetails.username}. To choose your new password, 
				go to <a href="https://uchi.world/reset?id=${userDetails.id}&type=newaccount&token=${hash}">
				https://uchi.world/reset?id=${userDetails.id}&type=newaccount&token=${hash}</a> to reset your password. This link is only valid for today`,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch {
    (error) => res.status(500).send(error);
  }
};
