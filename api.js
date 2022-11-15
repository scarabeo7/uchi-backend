import { Router } from "express";
import passport from "passport";
import { login, logout, ping, requestReset, verifyToken, resetPassword, createNewAdmin } from "./admins";
import { artUpload, media } from "./upload";
import { getArtwork, getPublicArtwork, updateArtwork, deleteArtwork } from "./artwork";
import { requiresLogin } from "./middleware";
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = new Router();

router.post("/upload", upload.single("image"), artUpload);

router.get("/media/:key", media);

router.post("/login", passport.authenticate("local"), login);

router.get("/logout", logout);

router.get("/ping", requiresLogin, ping);

router.post("/request-reset", requestReset);

router.get("/reset", verifyToken);

router.post("/admin", createNewAdmin);

router.put("/admin/:id", resetPassword);

router.get("/admin-artwork", requiresLogin, getArtwork);

router.get("/artwork", getPublicArtwork);

router.put("/artwork/:id", requiresLogin, updateArtwork);

router.delete("/artwork/:id", requiresLogin, deleteArtwork);

export default router;
