import type { ExtendedQuery } from "../types/types.d.ts";

const parseSortBy = (sortBy: string, sortByList: string[]) => {
  if (sortByList.includes(sortBy)) {
    return sortBy;
  }

  return "_id";
};

export const parseSortParams = (query: ExtendedQuery, sortByList: string[]) => {
  const { sortOrder, sortBy } = query;
  let parsedSortBy;

  if (sortBy) {
    parsedSortBy = parseSortBy(sortBy, sortByList);
  }

  return {
    sortOrder,
    sortBy: parsedSortBy,
  };
};
