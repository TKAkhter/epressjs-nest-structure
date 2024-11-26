import { Router } from 'express';
import { authMiddleware, zodValidation } from '../../middlewares';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createApiResponse } from '../../common/swagger/swagger-response-builder';
import { AuthSchema, ExtendTokenSchema, LogoutSchema, RegisterSchema } from './auth.dto';
import { AuthController } from './auth.controller';

const authRouter = Router();

export const authRegistry = new OpenAPIRegistry();
const authController = new AuthController();

authRegistry.register("Auth", AuthSchema);

authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthSchema } },
    },
  },
  responses: createApiResponse(AuthSchema, "Login Successfully"),
});
authRouter.post('/login', zodValidation(AuthSchema), authController.login);

authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: RegisterSchema } },
    },
  },
  responses: createApiResponse(RegisterSchema, "Register Successfully"),
});
authRouter.post('/register', zodValidation(RegisterSchema), authController.register);

authRegistry.registerPath({
  method: "post",
  path: "/auth/extend-token",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: ExtendTokenSchema } },
    },
  },
  responses: createApiResponse(ExtendTokenSchema, "Token Extended Successfully"),
});
authRouter.post('/extend-token', authMiddleware, authController.extendToken);

authRegistry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: {} } },
    },
  },
  responses: createApiResponse(LogoutSchema, "Logout Successfully"),
});
authRouter.post('/logout', authMiddleware, authController.logout);

export default authRouter;