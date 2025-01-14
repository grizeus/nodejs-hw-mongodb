import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  loginUserSchema,
  loginWithGoogleOAuthSchema,
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

router.get(
  "/get-oauth-url",
  ctrlWrapper(controller.getGoogleOAuthUrlController),
);

router.post(
  "/confirm-oauth",
  validateBody(loginWithGoogleOAuthSchema),
  ctrlWrapper(controller.loginWithGoogleController),
);

router.get("/verify", ctrlWrapper(controller.verifyController));

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
