import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  loginUserSchema,
  registerUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from "../validation/auth.js";
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

router.post("/logout", ctrlWrapper(controller.logoutController));

router.post("/refresh", ctrlWrapper(controller.refreshUserSessionController));

router.post(
  "/send-reset-email",
  validateBody(requestResetEmailSchema),
  ctrlWrapper(controller.requestResetEmailController),
);

router.post(
  "/reset-pwd",
  validateBody(resetPasswordSchema),
  ctrlWrapper(controller.resetPasswordController),
);

export default router;
