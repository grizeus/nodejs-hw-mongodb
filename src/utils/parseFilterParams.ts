import { CONTACT_TYPES } from "../constants/index.js";
import type { ExtendedQuery, FilterParams } from "../types/types.d.ts";

const parseContactType = (type: string) => {
  const isContactType = (contactType: string) =>
    CONTACT_TYPES.includes(contactType);

  if (isContactType(type)) {
    return type;
  }
};

const parseIsFavourite = (favourite: string) => {
  const isFavourite = (favourite: string) =>
    ["true", "false"].includes(favourite);

  if (isFavourite(favourite)) {
    return favourite;
  }
};

export const parseFilterParams = (query: ExtendedQuery): FilterParams => {
  const { type, isFavourite, name } = query;

  let parsedType;
  let parsedIsFavourite;
  if (type) {
    parsedType = parseContactType(type);
  }
  if (isFavourite) {
    parsedIsFavourite = parseIsFavourite(isFavourite);
  }
  return {
    type: parsedType,
    isFavourite: parsedIsFavourite,
    name,
  };
};