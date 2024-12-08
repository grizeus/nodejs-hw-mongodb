import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  createContactController,
  deleteContactController,
  getContactByIdController,
  getContactsController,
  patchContactController,
  upsertContactController,
} from "../controllers/contacts.js";
import { validateBody } from "../middlewares/validateBody.js";
import { createContactSchema } from "../validation/contacts.js";

const router = Router();

router.get("/contacts", ctrlWrapper(getContactsController));

router.get("/contacts/:contactId", ctrlWrapper(getContactByIdController));

router.post(
  "/contacts",
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);

router.delete("/contacts/:contactId", ctrlWrapper(deleteContactController));

router.put("/contacts/:contactId", ctrlWrapper(upsertContactController));

router.patch("/contacts/:contactId", ctrlWrapper(patchContactController));

export default router;
