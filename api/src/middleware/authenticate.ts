import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET;
if (!ACCESS_JWT_SECRET) {
  console.log('Missing ACCESS_JWT_SECRET');
  process.exit(1);
}

const authenticate: RequestHandler = (req, _res, next) => {
  // verify the token, similar to me endpoint, including error handling with try/catch
  // use updated errorHandler for WWW-authenticat header
  // add user.sub (user's _id) to the request body
  // Get the access token from the request headers.
  const authHeader = req.header('authorization'); // Bearer <access-token>
  const accessToken = authHeader?.split(' ')[1];
  if (!accessToken) throw new Error('Not authenticated', { cause: { status: 401 } });

  try {
    const decoded = jwt.verify(accessToken, ACCESS_JWT_SECRET) as jwt.JwtPayload;

    if (!decoded.sub) {
      throw new Error('Invalid access token', { cause: { status: 403 } });
    }

    req.user = {
      id: decoded.sub,
      roles: decoded.roles
    };
    next();
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

export default authenticate;
