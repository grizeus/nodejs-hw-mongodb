import { LoginTicket, OAuth2Client, TokenPayload } from "google-auth-library";
import path from "node:path";
import { readFile } from "node:fs/promises";
import createHttpError from "http-errors";

import { getEnvVar } from "./getEnvVar.js";

const PATH_JSON = path.join(process.cwd(), "google-oauth.json");

type GoogleOAuthConfig = {
  web: {
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    redirect_uris: string[];
  };
};

const oauthConfig: GoogleOAuthConfig = JSON.parse(
  await readFile(PATH_JSON, "utf-8"),
);

const googleOAuthClient = new OAuth2Client({
  clientId: getEnvVar("GOOGLE_AUTH_CLIENT_ID"),
  clientSecret: getEnvVar("GOOGLE_AUTH_CLIENT_SECRET"),
  redirectUri: oauthConfig.web.redirect_uris[0],
});

export const generateAuthUrl = (): string =>
  googleOAuthClient.generateAuthUrl({
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile openid",
    ],
    prompt: "consent",
  });

export const validateCode = async (code: string): Promise<LoginTicket> => {
  const { tokens } = await googleOAuthClient.getToken(code);
  if (!tokens.id_token) throw createHttpError(401, "Unauthorized");

  return await googleOAuthClient.verifyIdToken({
    idToken: tokens.id_token,
  });
};

export const getFullNameFromGoogleTokenPayload = (payload: TokenPayload) => {
  let fullName = "Guest";
  if (payload.given_name && payload.family_name) {
    fullName = `${payload.given_name} ${payload.family_name}`;
  } else if (payload.given_name) {
    fullName = payload.given_name;
  }

  return fullName;
};
