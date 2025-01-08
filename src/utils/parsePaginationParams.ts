import type { ExtendedQuery } from "../types/types.d.ts";

const parseNumber = (number: string | undefined, defaultValue: number) => {
  if (!number) {
    return defaultValue;
  }

  const parsedNumber = parseInt(number);
  if (Number.isNaN(parsedNumber)) {
    return defaultValue;
  }

  return parsedNumber;
};

export const parsePaginationParams = (query: ExtendedQuery) => {
  const { page, perPage } = query;

  const parsedPage = parseNumber(page, 1);
  const parsedPerPage = parseNumber(perPage, 10);

  return {
    page: parsedPage,
    perPage: parsedPerPage,
  };
};
