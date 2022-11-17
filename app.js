import express from "express";
import morgan from "morgan";
import path from "path";
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from "cors";

import router from "./api";
import db from "./db";
import { configuredHelmet, httpsOnly, logErrors, pushStateRouting } from "./middleware";

const apiRoot = "/api";
const staticDir = path.join(__dirname, "static");
require("./passport")(passport, db);

let corsOptions = {
  origin: " https://sea-lion-app-fylpk.ondigitalocean.app",
  optionsSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));

let sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    // sameSite: "none",
    // secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // One Week
  },
};

if (process.env.MODE !== "dev") {
  sessionOptions.cookie.secure = true;
  sessionOptions.cookie.sameSite = "none";
}

app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "20mb" }));
app.use(configuredHelmet());
app.use(logErrors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
})

if (app.get("env") === "production") {
	app.enable("trust proxy");
	app.use(httpsOnly());
}

app.use(apiRoot, router);

app.use(express.static(staticDir));
app.use(pushStateRouting(apiRoot, staticDir));

export default app;
