import { getAllContacts } from "../src/services/contacts";
import { ContactsCollection } from "../src/db/models/contacts";
import { calculatePaginationData } from "../src/utils/calculatePaginationData";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../src/db/models/contacts.js", () => ({
  ContactsCollection: {
    find: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    exec: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../src/utils/calculatePaginationData.js", () => ({
  calculatePaginationData: vi.fn(),
}));

describe("getAllContacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return contacts with default parameters", async () => {
    const mockContacts = [{ _id: "1", name: "John Doe" }];
    const mockPaginationData = { totalPages: 1, currentPage: 1, totalItems: 1 };

    ContactsCollection.find().exec.mockResolvedValue(mockContacts);
    ContactsCollection.find().countDocuments.mockResolvedValue(1);
    calculatePaginationData.mockReturnValue(mockPaginationData);

    const result = await getAllContacts({});

    expect(result).toEqual({
      data: mockContacts,
      ...mockPaginationData,
    });
    expect(ContactsCollection.find).toHaveBeenCalled();
    expect(calculatePaginationData).toHaveBeenCalledWith(1, 1, 10);
  });

  it("should apply filters correctly", async () => {
    const mockContacts = [{ _id: "1", name: "Jane Doe" }];
    const mockPaginationData = { totalPages: 1, currentPage: 1, totalItems: 1 };

    ContactsCollection.find().exec.mockResolvedValue(mockContacts);
    ContactsCollection.find().countDocuments.mockResolvedValue(1);
    calculatePaginationData.mockReturnValue(mockPaginationData);

    const filter = {
      type: "friend",
      isFavourite: true,
      name: "Jane",
      userId: "123",
    };
    const result = await getAllContacts({ filter });

    expect(result).toEqual({
      data: mockContacts,
      ...mockPaginationData,
    });
    expect(ContactsCollection.find).toHaveBeenCalled();
    expect(ContactsCollection.find().where).toHaveBeenCalledWith("contactType");
    expect(ContactsCollection.find().where).toHaveBeenCalledWith("isFavourite");
    expect(ContactsCollection.find().where).toHaveBeenCalledWith("name");
    expect(ContactsCollection.find().where).toHaveBeenCalledWith("userId");
    expect(calculatePaginationData).toHaveBeenCalledWith(1, 1, 10);
  });

  it("should handle pagination correctly", async () => {
    const mockContacts = [{ _id: "1", name: "John Doe" }];
    const mockPaginationData = {
      totalPages: 2,
      currentPage: 2,
      totalItems: 20,
    };

    ContactsCollection.find().exec.mockResolvedValue(mockContacts);
    ContactsCollection.find().countDocuments.mockResolvedValue(20);
    calculatePaginationData.mockReturnValue(mockPaginationData);

    const result = await getAllContacts({ page: 2, perPage: 10 });

    expect(result).toEqual({
      data: mockContacts,
      ...mockPaginationData,
    });
    expect(ContactsCollection.find).toHaveBeenCalled();
    expect(ContactsCollection.find().skip).toHaveBeenCalledWith(10);
    expect(ContactsCollection.find().limit).toHaveBeenCalledWith(10);
    expect(calculatePaginationData).toHaveBeenCalledWith(20, 2, 10);
  });

  it("should handle sorting correctly", async () => {
    const mockContacts = [{ _id: "1", name: "John Doe" }];
    const mockPaginationData = { totalPages: 1, currentPage: 1, totalItems: 1 };

    ContactsCollection.find().exec.mockResolvedValue(mockContacts);
    ContactsCollection.find().countDocuments.mockResolvedValue(1);
    calculatePaginationData.mockReturnValue(mockPaginationData);

    const result = await getAllContacts({ sortBy: "name", sortOrder: "asc" });

    expect(result).toEqual({
      data: mockContacts,
      ...mockPaginationData,
    });
    expect(ContactsCollection.find).toHaveBeenCalled();
    expect(ContactsCollection.find().sort).toHaveBeenCalledWith({
      name: "asc",
    });
    expect(calculatePaginationData).toHaveBeenCalledWith(1, 1, 10);
  });
});
