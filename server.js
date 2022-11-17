import http from "http";
import app from "./app";
import { cronJob } from "./notifications";
import { connectDb, disconnectDb } from "./db";

const port = parseInt(process.env.PORT || "3100");

const server = http.createServer(app);

server.on("listening", () => {
	const addr = server.address();
	const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
	// eslint-disable-next-line no-console
	console.log(`Listening on ${bind}`);
});

process.on("SIGTERM", () => server.close(() => disconnectDb()));

connectDb().then(() => server.listen(port, () => cronJob.start()));
