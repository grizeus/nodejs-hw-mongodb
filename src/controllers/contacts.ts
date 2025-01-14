import createHttpError from "http-errors";
import { Request, Response } from "express";

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
import {
  deleteFileFromUploadDir,
  saveFileToUploadDir,
} from "../utils/handleFileUploadDir.js";
import {
  deleteFileFromCloudinary,
  saveFileToCloudinary,
} from "../utils/handleFileCloudinary.js";
import { getEnvVar } from "../utils/getEnvVar.js";
import type {
  FilterParams,
  ExpandedRequest,
  Contact,
} from "../types/types.d.ts";
import { Types } from "mongoose";

const enableCloudinary = getEnvVar("ENABLE_CLOUDINARY") === "true";

export const getContactsController = async (req: Request, res: Response) => {
  const request = req as ExpandedRequest;
  const { page, perPage } = parsePaginationParams(request.query);
  const { sortBy, sortOrder } = parseSortParams(request.query, CONTACT_KEYS);
  const filter: FilterParams = parseFilterParams(request.query);
  filter.userId = request.user._id;

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

const savePhotoHandler = async (
  photo: globalThis.Express.Multer.File | undefined,
) => {
  let photoUrl;
  if (photo) {
    if (enableCloudinary) {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }
  return photoUrl;
};

const deletePhotoHandler = async (photoUrl: string): Promise<void> => {
  const isOnCloudinary = photoUrl.slice(0, 26) === "https://res.cloudinary.com";

  try {
    if (isOnCloudinary) {
      // extract publicId from URI
      const extPos = photoUrl.lastIndexOf(".");
      const nameStart = photoUrl.lastIndexOf("/") + 1;
      const publicId = photoUrl.slice(nameStart, extPos);

      await deleteFileFromCloudinary(publicId);
    } else {
      const nameStart = photoUrl.lastIndexOf("/") + 1;
      const filename = photoUrl.slice(nameStart);
      await deleteFileFromUploadDir(filename);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw createHttpError(500, "Can't delete photo");
    }
    throw err;
  }
};

export const getContactByIdController = async (req: Request, res: Response) => {
  const request = req as ExpandedRequest;
  const { contactId: _id } = request.params;
  const userId = request.user._id;
  const contact = await getContactById({
    _id: new Types.ObjectId(_id),
    userId,
  });

  if (!contact) {
    throw createHttpError(404, `Contact with id ${_id} not found`);
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${_id}!`,
    data: contact,
  });
};

export const createContactController = async (req: Request, res: Response) => {
  const request = req as ExpandedRequest;
  const userId = request.user._id;
  const photo = request.file;
  const photoUrl = await savePhotoHandler(photo);

  const contact = await createContact({ userId, ...req.body, photo: photoUrl });

  res.status(201).json({
    status: 201,
    message: "Successfully created a contact!",
    data: contact,
  });
};

export const deleteContactController = async (req: Request, res: Response) => {
  const request = req as ExpandedRequest;
  const { contactId: _id } = request.params;
  const userId = request.user._id;

  // delete photo before deleting from DB
  const { photo } = (await getContactById({
    _id: new Types.ObjectId(_id),
    userId,
  })) as Contact;
  if (photo) {
    await deletePhotoHandler(photo);
  }

  const contact = await deleteContact({ _id: new Types.ObjectId(_id), userId });

  if (!contact) {
    throw createHttpError(404, "Contact not found");
  }

  res.status(204).send();
};

export const upsertContactController = async (req: Request, res: Response) => {
  const request = req as ExpandedRequest;
  const { contactId: _id } = request.params;
  const userId = request.user._id;
  const photo = req.file;

  const photoUrl = await savePhotoHandler(photo);

  const result = await updateContact(
    { _id: new Types.ObjectId(_id), userId },
    { ...req.body, photo: photoUrl },
    {
      upsert: true,
    },
  );

  if (result === null) {
    throw createHttpError(404, "Contact not found");
  }

  const { isNew, data } = result;

  const status = isNew ? 201 : 200;

  res.status(status).json({
    status: status,
    message: "Successfully upserted a contact!",
    data,
  });
};

export const patchContactController = async (req: Request, res: Response) => {
  const request = req as ExpandedRequest;
  const { contactId: _id } = request.params;
  const userId = request.user._id;
  const photo = req.file;

  const photoUrl = await savePhotoHandler(photo);

  const result = await updateContact(
    { _id: new Types.ObjectId(_id), userId },
    { ...req.body, photo: photoUrl },
  );

  if (result === null) {
    throw createHttpError(404, "Contact not found");
  }

  const { data } = result;

  res.status(200).json({
    status: 200,
    message: "Successfully patched a contact!",
    data,
  });
};
