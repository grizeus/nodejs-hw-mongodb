import { Request } from "express";
import { Query } from "express-serve-static-core";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

export type Session = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  accessTokenValidUntil: Date;
  refreshTokenValidUntil: Date;
};

export type User = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
};

export type Contact = {
  _id: Types.ObjectId;
  name: string;
  phoneNumber: string;
  email?: string;
  isFavourite?: string;
  contactType: string;
  userId: Types.ObjectId;
  photo?: string;
};

export type FilterParams = {
  type?: string;
  isFavourite?: string;
  name?: string;
  userId?: Types.ObjectId;
};

export type ExtendedQuery = Query & {
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: string;
  perPage?: string;
} & FilterParams;

export type ExpandedRequest = Request & {
  query: ExtendedQuery;
  file?: globalThis.Express.Multer.File;
  user: User;
};

export type AuthPayload = {
  name?: string;
  email: string;
  password: string;
};

export type AggregatedIds = {
  userId: Types.ObjectId;
  _id: Types.ObjectId;
};

export type UpdatedContact = {
  data: Contact;
  isNew: boolean;
};

export type SortOrder = "asc" | "desc";

export type MongoServerError = Error & {
  code?: number;
  status?: number;
};

type ExtendedJwtPayload = JwtPayload & {
  sub: Types.ObjectId;
};
