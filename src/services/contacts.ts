import { ContactsCollection } from "../db/models/contacts.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import type { AggregatedIds, SortOrder, ExpandedRequest, FilterParams, UpdatedContact, User } from "../types/types.d.ts";

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = "asc",
  sortBy = "_id",
  filter = {},
}: {
  page: number,
  perPage: number,
  sortOrder: SortOrder,
  sortBy: string,
  filter: FilterParams,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find();

  if (filter.type) {
    contactsQuery.where("contactType").equals(filter.type);
  }

  if (filter.isFavourite) {
    contactsQuery.where("isFavourite").equals(filter.isFavourite);
  }

  if (filter.name) {
    contactsQuery.where("name").regex(new RegExp(filter.name, "i"));
  }

  if (filter.userId) {
    contactsQuery.where("userId").equals(filter.userId);
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find({ userId: filter.userId })
      .merge(contactsQuery)
      .countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, page, perPage);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = (filter: AggregatedIds) => ContactsCollection.findOne(filter);

export const createContact = (payload: User) => ContactsCollection.create(payload);

export const deleteContact = (filter: AggregatedIds) =>
  ContactsCollection.findOneAndDelete(filter);

export const updateContact = async (filter: AggregatedIds, payload: ExpandedRequest, options = {}): Promise<UpdatedContact | null> => {
  const rawRes = await ContactsCollection.findOneAndUpdate(filter, payload, {
    new: true,
    includeResultMetadata: true,
    ...options,
  });

  if (!rawRes || !rawRes.value) {
    return null;
  }

  return {
    data: rawRes.value,
    isNew: Boolean(rawRes?.lastErrorObject?.upserted),
  };
};
