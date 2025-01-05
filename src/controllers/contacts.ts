import createHttpError from "http-errors";
import { Response } from "express";

import {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
  updateContact,
} from "../services/contacts.js";
import { parsePaginationParams } from "../utils/parsePaginationParams.js";
import { parseSortParams } from "../utils/parseSortParams.js";
import { parseFilterParams } from "../utils/parseFilterParams.js";
import { CONTACT_KEYS } from "../db/models/contacts.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { getEnvVar } from "../utils/getEnvVar.js";
import type { FilterParams, TypedRequest, User } from "../types/types.d.ts";

export const getContactsController = async (
  req: TypedRequest<{ user: User }>,
  res: Response,
) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query, CONTACT_KEYS);
  const filter: FilterParams = parseFilterParams(req.query);
  filter.userId = req.body.user._id;

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });
  res.status(200).json({
    status: 200,
    message: "Contacts retrieved successfully",
    data: contacts,
  });
};

const savePhotoHandler = async (photo: string) => {
  let photoUrl;
  if (photo) {
    if (getEnvVar("ENABLE_CLOUDINARY") === "true") {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }
  return photoUrl;
};

export const getContactByIdController = async (
  req: TypedRequest<{ user: User }>,
  res: Response,
) => {
  const { contactId: _id } = req.params;
  const userId = req.body.user._id;
  const contact = await getContactById({ _id, userId });

  if (!contact) {
    throw createHttpError(404, `Contact with id ${_id} not found`);
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${_id}!`,
    data: contact,
  });
};

export const createContactController = async (
  req: TypedRequest<{ user: User; file: string }>,
  res: Response,
) => {
  const userId = req.body.user._id;
  const photo = req.body.file;

  const photoUrl = await savePhotoHandler(photo);

  const contact = await createContact({ userId, ...req.body, photo: photoUrl });

  res.status(201).json({
    status: 201,
    message: "Successfully created a contact!",
    data: contact,
  });
};

export const deleteContactController = async (
  req: TypedRequest<{ user: User }>,
  res: Response,
) => {
  const { contactId: _id } = req.params;
  const userId = req.body.user._id;
  const contact = await deleteContact({ _id, userId });

  if (!contact) {
    throw createHttpError(404, "Contact not found");
  }

  res.status(204).send();
};

export const upsertContactController = async (
  req: TypedRequest<{ user: User; file: string }>,
  res: Response,
) => {
  const { contactId: _id } = req.params;
  const userId = req.body.user._id;
  const photo = req.body.file;

  const photoUrl = await savePhotoHandler(photo);

  const { isNew, data } = await updateContact(
    { _id, userId },
    { ...req.body, photo: photoUrl },
    {
      upsert: true,
    },
  );

  if (!data) {
    throw createHttpError(404, "Contact not found");
  }

  const status = isNew ? 201 : 200;

  res.status(status).json({
    status: status,
    message: "Successfully upserted a contact!",
    data,
  });
};

export const patchContactController = async (
  req: TypedRequest<{ user: User; file: string }>,
  res: Response,
) => {
  const { contactId: _id } = req.params;
  const userId = req.body.user._id;
  const photo = req.body.file;

  const photoUrl = await savePhotoHandler(photo);

  const { data } = await updateContact(
    { _id, userId },
    { ...req.body, photo: photoUrl },
  );

  if (!data) {
    throw createHttpError(404, "Contact not found");
  }

  res.status(200).json({
    status: 200,
    message: "Successfully patched a contact!",
    data,
  });
};
