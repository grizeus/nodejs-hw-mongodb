import { vi, describe, it, expect, beforeEach } from "vitest";
import nodemailer from "nodemailer";
import { SMTP } from "../src/constants/index.js";
import { sendEmail } from "../src/utils/sendMail.js";

vi.mock("nodemailer", () => ({
  __esModule: true,
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn(),
    }),
  },
}));

vi.mock("./getEnvVar.js", () => ({
  __esModule: true,
  default: vi.fn((key) => {
    switch (key) {
      case SMTP.SMTP_HOST:
        return "smtp.example.com";
      case SMTP.SMTP_PORT:
        return "587";
      case SMTP.SMTP_USER:
        return "test@example.com";
      case SMTP.SMTP_PASSWORD:
        return "password123";
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }),
}));

describe("sendEmail function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call transporter.sendMail with provided options", async () => {
    const emailOptions = {
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    await sendEmail(emailOptions);

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(
      emailOptions,
    );
  });
  it("should resolve with the result of transporter.sendMail", async () => {
    const mockResult = { messageId: "<1234567890@smtp.example.com>" };
    nodemailer.createTransport().sendMail.mockResolvedValue(mockResult);

    const result = await sendEmail({});

    expect(result).toEqual(mockResult);
  });

  it("should reject if transporter.sendMail throws an error", async () => {
    const mockError = new Error("Failed to send the email, please try again later.");
    nodemailer.createTransport().sendMail.mockRejectedValue(mockError);

    await expect(sendEmail({})).rejects.toThrow(mockError);
  });
});
