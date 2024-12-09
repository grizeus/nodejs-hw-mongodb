const parseContactType = (contactType) => {
  const isString = typeof contactType === "string";
  if (!isString) {
    return;
  }

  const isContactType = (contactType) =>
    ["work", "personal", "home"].includes(contactType);

  if (isContactType(contactType)) {
    return contactType;
  }
};

const parseIsFavourite = (isFavourite) => {
  const isString = typeof isFavourite === "string";
  if (!isString) {
    return;
  }

  const parsedIsFavourite = isFavourite === "true";
  return parsedIsFavourite;
};

const parseNumber = (number) => {
  const isString = typeof number === "string";
  if (!isString) return;

  const parsedNumber = parseInt(number);
  if (Number.isNaN(parsedNumber)) {
    return;
  }

  return parsedNumber;
};

export const parseFilterParams = (query) => {
  const { contactType, isFavourite } = query;

  const parsedContactType = parseContactType(contactType);
  const parsedIsFavourite = parseIsFavourite(isFavourite);

  return {
    contactType: parsedContactType,
    isFavourite: parsedIsFavourite,
  };
};
