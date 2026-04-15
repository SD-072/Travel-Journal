import { Router } from 'express';
import { login, logout, me, refresh, register } from '#controllers';
import { validateBody } from '#middleware';
import { loginSchema, refreshTokenSchema, registerSchema } from '#schemas';

const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), register);

authRoutes.post('/login', validateBody(loginSchema), login);

authRoutes.post('/refresh', validateBody(refreshTokenSchema), refresh);

authRoutes.post('/logout', validateBody(refreshTokenSchema), logout);

authRoutes.get('/me', me);

export default authRoutes;
