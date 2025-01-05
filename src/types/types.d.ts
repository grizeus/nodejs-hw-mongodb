import { Request } from "express";
import { Query } from "express-serve-static-core";

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

export interface TypedRequest<T> extends Request {
  body: T;
}
