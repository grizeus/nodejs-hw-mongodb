import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  createContactController,
  getContactByIdController,
  getContactsController,
} from "../controllers/contacts.js";

const router = Router();

router.get("/contacts", ctrlWrapper(getContactsController));

router.get("/contacts/:contactId", ctrlWrapper(getContactByIdController));

router.post("/contacts", ctrlWrapper(createContactController));

export default router;
