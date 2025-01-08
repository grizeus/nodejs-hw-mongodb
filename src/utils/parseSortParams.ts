import type { SortOrder, ExtendedQuery } from "../types/types.d.ts";

const parseSortOrder = (sortOrder: SortOrder) => {
  if (sortOrder === "asc" || sortOrder === "desc") {
    return sortOrder;
  }

  return "asc";
};

const parseSortBy = (sortBy: string, sortByList: string[]) => {
  if (sortByList.includes(sortBy)) {
    return sortBy;
  }

  return "_id";
};

export const parseSortParams = (query: ExtendedQuery, sortByList: string[]) => {
  const { sortOrder, sortBy } = query;

  let parsedSortBy;
  let parsedSortOrder;
  
  if (sortOrder) {
    parsedSortOrder = parseSortOrder(sortOrder);
  }

  if (sortBy) {
    parsedSortBy = parseSortBy(sortBy, sortByList);
  }

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
