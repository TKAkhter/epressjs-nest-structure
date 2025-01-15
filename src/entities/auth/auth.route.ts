import { Router } from "express";
import { authMiddleware, zodValidation } from "@/middlewares";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/common/swagger/swagger-response-builder";
import {
  AuthSchema,
  ExtendTokenSchema,
  ForgotPasswordSchema,
  LogoutSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "@/entities/auth/auth.dto";
import { AuthController } from "@/entities/auth/auth.controller";

const authRouter = Router();

const TAG = "Auth";
const ROUTE = `/${TAG.toLowerCase()}`;

export const authRegistry = new OpenAPIRegistry();
const authController = new AuthController();

authRegistry.register(TAG, AuthSchema);

authRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/login`,
  tags: [TAG],
  summary: "Login",
  request: {
    body: {
      content: { "application/json": { schema: AuthSchema } },
    },
  },
  responses: createApiResponse(AuthSchema, "Login Successfully"),
});
authRouter.post("/login", zodValidation(AuthSchema), authController.login);

//====================================================================================================

authRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/register`,
  tags: [TAG],
  summary: "Register",
  request: {
    body: {
      content: { "application/json": { schema: RegisterSchema } },
    },
  },
  responses: createApiResponse(RegisterSchema, "Register Successfully"),
});
authRouter.post("/register", zodValidation(RegisterSchema), authController.register);

//====================================================================================================

authRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/extend-token`,
  tags: [TAG],
  summary: "Extend Token",
  request: {
    body: {
      content: { "application/json": { schema: ExtendTokenSchema } },
    },
  },
  responses: createApiResponse(ExtendTokenSchema, "Token Extended Successfully"),
});
authRouter.post(
  "/extend-token",
  authMiddleware,
  zodValidation(ExtendTokenSchema),
  authController.extendToken,
);

//====================================================================================================

authRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/logout`,
  tags: [TAG],
  summary: "Logout",
  responses: createApiResponse(LogoutSchema, "Logout Successfully"),
});
authRouter.get("/logout", authMiddleware, authController.logout);

//====================================================================================================

authRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/forgot-password`,
  tags: [TAG],
  summary: "Forgot Password",
  request: {
    body: {
      content: { "application/json": { schema: ForgotPasswordSchema } },
    },
  },
  responses: createApiResponse(ForgotPasswordSchema, "Reset link sent. Check you email"),
});
authRouter.post(
  "/forgot-password",
  zodValidation(ForgotPasswordSchema),
  authController.forgotPassword,
);

//====================================================================================================

authRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/reset-password`,
  tags: [TAG],
  summary: "Reset Password",
  request: {
    body: {
      content: { "application/json": { schema: ResetPasswordSchema } },
    },
  },
  responses: createApiResponse(ResetPasswordSchema, "Password reset successful"),
});
authRouter.post(
  "/reset-password",
  zodValidation(ResetPasswordSchema),
  authController.resetPassword,
);

export default authRouter;
