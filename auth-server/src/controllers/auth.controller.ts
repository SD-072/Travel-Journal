import bcrypt from 'bcrypt';
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import type z from 'zod';
import { ACCESS_JWT_SECRET, SALT_ROUNDS } from '#config';
import { RefreshToken, User } from '#models';
import type { loginSchema, refreshTokenSchema, registerSchema } from '#schemas';
import { createTokens } from '#utils';

type SuccessResMessage = {
  message: string;
};

type TokenResBody = SuccessResMessage & {
  accessToken: string;
  refreshToken: string;
};

type NoRouterParams = Record<string, never>;

type UserDTO = z.infer<typeof registerSchema>;
type UserProfile = Omit<UserDTO, 'password'> & {
  _id: Types.ObjectId;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

type MeResBody = SuccessResMessage & {
  user: UserProfile;
};

type LoginDTO = z.infer<typeof loginSchema>;
type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

export const register: RequestHandler<NoRouterParams, TokenResBody, UserDTO> = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const userExists = await User.exists({ email });
  if (userExists) throw new Error('Email already registered', { cause: { status: 409 } }); // 409 conflict code

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPW = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    password: hashedPW,
    firstName,
    lastName
  } satisfies UserDTO);

  const [refreshToken, accessToken] = await createTokens(user);

  res.status(201).json({ message: 'Registered', refreshToken, accessToken });
};

export const login: RequestHandler<NoRouterParams, TokenResBody, LoginDTO> = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).lean(); // lean() = read-only & we get JS-object, isntead of MongoDB document
  if (!user) throw new Error('Incorrect credentials', { cause: { status: 401 } });

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Incorrect credentials', { cause: { status: 401 } });

  await RefreshToken.deleteMany({ userId: user._id });

  const [refreshToken, accessToken] = await createTokens(user);

  res.status(200).json({ message: 'Welcome back!', refreshToken, accessToken });
};

export const refresh: RequestHandler<NoRouterParams, TokenResBody, RefreshTokenDTO> = async (
  req,
  res
) => {
  // destructure refreshToken from the body of request
  const { refreshToken } = req.body;

  // query the db for the refresh token as a token property that matches the refreshToken
  const storedToken = await RefreshToken.findOne({ token: refreshToken }).lean();

  // if not stored token is found, throw a 403
  if (!storedToken) throw new Error('Please sign in again', { cause: { status: 403 } });

  // delete the stored one from the db
  await RefreshToken.findByIdAndDelete(storedToken._id);
  // query the db for a user that matches the userId of the stored token
  const user = await User.findById(storedToken.userId).lean();
  // throw a 403 if no user is found
  if (!user) throw new Error('User account not found', { cause: { status: 403 } });

  // create new tokens with our util function
  const [newRefreshToken, newAccessToken] = await createTokens(user);
  // send success message and new tokens in the body of the response
  res.json({ message: 'Refreshed', refreshToken: newRefreshToken, accessToken: newAccessToken });
};

export const logout: RequestHandler<NoRouterParams, SuccessResMessage, RefreshTokenDTO> = async (
  req,
  res
) => {
  // clearing all tokens from local storage on the client
  // destructure refreshToken from the body of the request
  const { refreshToken } = req.body;
  // delete refreshToken from db that matches that refreshToken
  await RefreshToken.deleteOne({ token: refreshToken });

  // send generic success message in response body
  res.json({ message: 'Successfully logged out' });
};

export const me: RequestHandler<NoRouterParams, MeResBody> = async (req, res, next) => {
  // Get the access token from the request headers.
  const authHeader = req.header('authorization'); // Bearer <access-token>
  // console.log('authHeader:\n', authHeader);
  const accessToken = authHeader?.split(' ')[1];
  // console.log('accessToken:\n', accessToken);
  // If there is no access token, throw a 401 error with an appropriate message.
  if (!accessToken) throw new Error('Please sign in', { cause: { status: 401 } });

  try {
    // Verify the access token.
    const decoded = jwt.verify(accessToken, ACCESS_JWT_SECRET) as jwt.JwtPayload;
    // console.log(decoded);
    //
    // If decoded.sub is falsy, throw a 403 error and indicate that the token is invalid or expired.
    if (!decoded.sub) throw new Error('Invalid access token', { cause: { status: 401 } });

    // Query the DB to find the user by the `_id`` that matches decoded.sub.
    const user = await User.findById(decoded.sub).select('-password').lean();

    // Throw a 404 error if no user is found.
    if (!user) throw new Error('User not found', { cause: { status: 404 } });

    // Send a generic success message and the user info in the response body.
    res.json({ message: 'Valid token', user });
  } catch (error) {
    // If the error is because the token expired, call next with a 401 error and an `ACCESS_TOKEN_EXPIRED` code.
    if (error instanceof jwt.TokenExpiredError) {
      next(
        new Error('Expired access token', {
          cause: { status: 401, code: 'ACCESS_TOKEN_EXPIRED' }
        })
      );
    } else {
      // Call next with a new 401 error indicating an invalid access token.
      next(new Error('Invalid access token.', { cause: { status: 401 } }));
    }
  }
};
