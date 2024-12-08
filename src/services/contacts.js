import { ContactsCollection } from "../db/models/contacts.js";

export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find();
  return contacts;
};

export const getContactById = async (id) => {
  const contact = await ContactsCollection.findById(id);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const deleteContact = async (contactId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
  });

  export const updateContact = async (contactId, payload, options = {}) => {
    const rawRes = await ContactsCollection.findOneAndUpdate({ _id: contactId }, payload, {
      new: true,
      includeResultMetadata: true,
      ...options,
    },);
  };

  return contact;
};
