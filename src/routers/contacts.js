import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import * as controller from "../controllers/contacts.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../validation/contacts.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrlWrapper(controller.getContactsController));

router.get(
  "/:contactId",
  isValidId,
  ctrlWrapper(controller.getContactByIdController),
);

router.post(
  "/",
  upload.single("photo"),
  validateBody(createContactSchema),
  ctrlWrapper(controller.createContactController),
);

router.delete(
  "/:contactId",
  isValidId,
  ctrlWrapper(controller.deleteContactController),
);

router.put(
  "/:contactId",
  isValidId,
  upload.single("photo"),
  validateBody(createContactSchema),
  ctrlWrapper(controller.upsertContactController),
);

router.patch(
  "/:contactId",
  isValidId,
  upload.single("photo"),
  validateBody(updateContactSchema),
  ctrlWrapper(controller.patchContactController),
);

export default router;
