const parseContactType = (type) => {
  const isString = typeof type === "string";
  if (!isString) {
    return;
  }

  const isContactType = (contactType) =>
    ["work", "personal", "home"].includes(contactType);

  if (isContactType(type)) {
    return type;
  }
};

const parseIsFavourite = (favourite) => {
  const isString = typeof favourite === "string";
  if (!isString) {
    return;
  }

  const isFavourite = (favourite) => ["true", "false"].includes(favourite);

  if (isFavourite(favourite)) {
    return favourite;
  }
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;

  const parsedType = parseContactType(type);
  const parsedIsFavourite = parseIsFavourite(isFavourite);

  return {
    type: parsedType,
    isFavourite: parsedIsFavourite,
  };
};
