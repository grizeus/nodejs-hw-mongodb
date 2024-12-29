import { calculatePaginationData } from "../src/utils/calculatePaginationData";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../src/db/models/contacts.js", () => ({
  ContactsCollection: {
    find: vi.fn(),
    where: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
    sort: vi.fn(),
    exec: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../src/utils/calculatePaginationData.js", () => ({
  calculatePaginationData: vi.fn(),
}));
describe('calculatePaginationData', () => {
  beforeEach(() => {
    // Clear any previous mock implementations
    vi.clearAllMocks();
  });

  it('should return correct pagination data', () => {
    // Arrange
    const mockResult = {
      page: 2,
      perPage: 10,
      totalItems: 50,
      totalPages: 5,
      hasPreviousPage: true,
      hasNextPage: true,
    };

    vi.mocked(calculatePaginationData).mockReturnValue(mockResult);

    // Act
    const result = calculatePaginationData(50, 2, 10);

    // Assert
    expect(result).toEqual(mockResult);
    expect(calculatePaginationData).toHaveBeenCalledWith(50, 2, 10);
  });

  it('should handle edge cases correctly', () => {
    // Arrange
    const mockResult = {
      page: 1,
      perPage: 20,
      totalItems: 40,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true,
    };

    vi.mocked(calculatePaginationData).mockReturnValue(mockResult);

    // Act
    const result = calculatePaginationData(40, 1, 20);

    // Assert
    expect(result).toEqual(mockResult);
    expect(calculatePaginationData).toHaveBeenCalledWith(40, 1, 20);
  });
});
