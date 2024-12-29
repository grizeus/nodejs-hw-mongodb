import { describe, it, expect, beforeEach, vi } from "vitest";
import createHttpError from "http-errors";
import { SessionCollection } from "../src/db/models/session.js";
import { refreshUsersSession } from "../src/services/auth.js";

vi.mock("../src/db/models/session.js");
vi.mock("http-errors");
vi.mock("crypto", () => ({
  randomBytes: vi.fn(() => ({
    toString: vi.fn(() => "randomString"),
  })),
}));

describe("refreshUsersSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if the session is not found", async () => {
    SessionCollection.findOne = vi.fn().mockResolvedValue(null);
    createHttpError.mockImplementation((status, message) => ({
      status,
      message,
    }));

    await expect(
      refreshUsersSession({
        sessionId: "invalidId",
        refreshToken: "invalidToken",
      }),
    ).rejects.toEqual({ status: 401, message: "Session not found" });

    expect(SessionCollection.findOne).toHaveBeenCalledWith({
      _id: "invalidId",
      refreshToken: "invalidToken",
    });
  });

  it("should throw an error if the session token is expired", async () => {
    const expiredSession = {
      refreshTokenValidUntil: new Date(Date.now() - 1000),
    };
    SessionCollection.findOne = vi.fn().mockResolvedValue(expiredSession);
    createHttpError.mockImplementation((status, message) => ({
      status,
      message,
    }));

    await expect(
      refreshUsersSession({
        sessionId: "expiredId",
        refreshToken: "expiredToken",
      }),
    ).rejects.toEqual({ status: 401, message: "Session token expired" });

    expect(SessionCollection.findOne).toHaveBeenCalledWith({
      _id: "expiredId",
      refreshToken: "expiredToken",
    });
  });

  it("should create a new session if the session is valid", async () => {
    const validSession = {
      _id: "validId",
      userId: "userId",
      refreshToken: "validToken",
      refreshTokenValidUntil: new Date(Date.now() + 1000),
    };
    SessionCollection.findOne = vi.fn().mockResolvedValue(validSession);
    SessionCollection.deleteOne = vi.fn().mockResolvedValue({});
      SessionCollection.create = vi.fn().mockResolvedValue({
        userId: "userId",
        accessToken: "randomString",
        refreshToken: "randomString",
        accessTokenValidUntil: Date.now() + 1000,
        refreshTokenValidUntil: Date.now() + 1000,
      });

    const result = await refreshUsersSession({
      sessionId: "validId",
      refreshToken: "validToken",
    });

    expect(SessionCollection.findOne).toHaveBeenCalledWith({
      _id: "validId",
      refreshToken: "validToken",
    });
    expect(SessionCollection.deleteOne).toHaveBeenCalledWith({
      _id: "validId",
      refreshToken: "validToken",
    });
    expect(SessionCollection.create).toHaveBeenCalledWith({
      userId: "userId",
      accessToken: "randomString",
      refreshToken: "randomString",
      accessTokenValidUntil: expect.any(Number),
      refreshTokenValidUntil: expect.any(Number),
    });
    expect(result).toEqual({
      userId: "userId",
      accessToken: "randomString",
      refreshToken: "randomString",
      accessTokenValidUntil: expect.any(Number),
      refreshTokenValidUntil: expect.any(Number),
    });
  });

  it("should throw an error if the refresh token is invalid", async () => {
    SessionCollection.findOne = vi.fn().mockResolvedValue(null);
    createHttpError.mockImplementation((status, message) => ({
      status,
      message,
    }));

    await expect(
      refreshUsersSession({
        sessionId: "validId",
        refreshToken: "invalidToken",
      }),
    ).rejects.toEqual({ status: 401, message: "Session not found" });

    expect(SessionCollection.findOne).toHaveBeenCalledWith({
      _id: "validId",
      refreshToken: "invalidToken",
    });
  });

  it("should throw an error if the session ID is invalid", async () => {
    SessionCollection.findOne = vi.fn().mockResolvedValue(null);
    createHttpError.mockImplementation((status, message) => ({
      status,
      message,
    }));

    await expect(
      refreshUsersSession({
        sessionId: "invalidId",
        refreshToken: "validToken",
      }),
    ).rejects.toEqual({ status: 401, message: "Session not found" });

    expect(SessionCollection.findOne).toHaveBeenCalledWith({
      _id: "invalidId",
      refreshToken: "validToken",
    });
  });
});
