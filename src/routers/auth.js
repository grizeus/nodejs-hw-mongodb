import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { loginUserSchema, registerUserSchema } from "../validation/auth.js";
import * as controller from "../controllers/auth.js";
import { validateBody } from "../middlewares/validateBody.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerUserSchema),
  ctrlWrapper(controller.registerController),
);

router.post(
  "/login",
  validateBody(loginUserSchema),
  ctrlWrapper(controller.loginController),
);

router.post(
  "/logout",
  ctrlWrapper(controller.logoutController),
);

export default router;
