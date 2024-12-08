import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  createContactController,
  deleteContactController,
  getContactByIdController,
  getContactsController,
  upsertContactController
} from "../controllers/contacts.js";

const router = Router();

router.get("/contacts", ctrlWrapper(getContactsController));

router.get("/contacts/:contactId", ctrlWrapper(getContactByIdController));

router.post("/contacts", ctrlWrapper(createContactController));

router.delete("/contacts/:contactId", ctrlWrapper(deleteContactController));

router.put('/contacts/:contactId', ctrlWrapper(upsertContactController));

export default router;
