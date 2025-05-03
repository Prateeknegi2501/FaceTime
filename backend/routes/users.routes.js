import { Router } from "express";
import { login, register } from "../controllers/user.controller.js";
import { wrapAsync } from "../Utils/wrapAsync.js";

const router = Router();

router.route("/register").post(wrapAsync(register));
router.route("/login").post(wrapAsync(login));
router.route("/add_to_activity");
router.route("/add_All_activity");

export default router;
