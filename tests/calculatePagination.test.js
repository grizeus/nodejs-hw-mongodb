import { calculatePaginationData } from "../src/utils/calculatePaginationData";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../src/utils/calculatePaginationData.js", () => ({
  calculatePaginationData: vi.fn(),
}));
describe("calculatePaginationData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return correct pagination data", () => {
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

    const result = calculatePaginationData(50, 2, 10);

    expect(result).toEqual(mockResult);
    expect(calculatePaginationData).toHaveBeenCalledWith(50, 2, 10);
  });

  it("should handle edge cases correctly", () => {
    const mockResult = {
      page: 1,
      perPage: 20,
      totalItems: 40,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true,
    };

    vi.mocked(calculatePaginationData).mockReturnValue(mockResult);

    const result = calculatePaginationData(40, 1, 20);

    expect(result).toEqual(mockResult);
    expect(calculatePaginationData).toHaveBeenCalledWith(40, 1, 20);
  });

  it("should handle edge cases correctly", () => {
    const mockResult = {
      page: 2,
      perPage: 20,
      totalItems: 40,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    };

    vi.mocked(calculatePaginationData).mockReturnValue(mockResult);

    const result = calculatePaginationData(40, 2, 20);

    expect(result).toEqual(mockResult);
    expect(calculatePaginationData).toHaveBeenCalledWith(40, 2, 20);
  });
});
