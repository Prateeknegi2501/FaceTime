import { Router } from "express";
import { addToHistory, getUserHistory, login, register } from "../controllers/user.controller.js";
import { wrapAsync } from "../Utils/wrapAsync.js";

const router = Router();

router.route("/register").post(wrapAsync(register));
router.route("/login").post(wrapAsync(login));
router.route("/add_to_activity").post(wrapAsync(addToHistory));
router.route("/get_all_activity").get(wrapAsync(getUserHistory));

export default router;
