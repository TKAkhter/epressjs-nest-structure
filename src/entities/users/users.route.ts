import { UpdateUsersSchema, UsersSchema } from "@/entities/users/users.dto";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UsersController } from "@/entities/users/users.controller";
import { authMiddleware } from "@/middlewares";
import { createApiResponse } from "@/common/swagger/swagger-response-builder";
import { zodValidation } from "@/middlewares/zod-validation";
import { z } from "zod";
import { FindByQuerySchema } from "@/schemas/find-by-query";
import { Router } from "express";
import { RegisterSchema } from "@/entities/auth/auth.dto";
import { ImportFileSchema } from "@/schemas/import-file";
import { uploadImportMiddleware } from "@/common/multer/multer";

const usersRouter = Router();
usersRouter.use(authMiddleware);

const TAG = "Users";
const ROUTE = `/${TAG.toLowerCase()}`;

export const usersRegistry = new OpenAPIRegistry();
const usersController = new UsersController();

usersRegistry.register(TAG, UsersSchema);

usersRegistry.registerPath({
  method: "get",
  path: ROUTE,
  summary: `Get all ${TAG}`,
  tags: [TAG],
  responses: createApiResponse(z.array(UsersSchema), "Success"),
});
usersRouter.get("/", usersController.getAll);

//====================================================================================================

usersRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/import`,
  tags: [TAG],
  summary: `Import ${TAG}`,
  request: {
    body: {
      content: { "multipart/form-data": { schema: ImportFileSchema } },
    },
  },
  responses: createApiResponse(z.null(), `${TAG}s Imported Successfully`),
});
usersRouter.post("/import", uploadImportMiddleware, usersController.import);

//====================================================================================================

usersRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/export`,
  summary: `Export ${TAG}`,
  tags: [TAG],
  responses: createApiResponse(z.null(), `${TAG}s Exported Successfully`),
});
usersRouter.get("/export", usersController.export);

//====================================================================================================

usersRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/{id}`,
  tags: [TAG],
  summary: `Get ${TAG} by id`,
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(UsersSchema, "Success"),
});
usersRouter.get("/:id", usersController.getById);

//====================================================================================================

usersRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/uuid/{uuid}`,
  tags: [TAG],
  summary: `Get ${TAG} by uuid`,
  request: {
    params: z.object({ uuid: z.string() }),
  },
  responses: createApiResponse(UsersSchema, "Success"),
});
usersRouter.get("/uuid/:uuid", usersController.getByUuid);

//====================================================================================================

usersRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/email/{email}`,
  tags: [TAG],
  summary: `Get ${TAG} by email`,
  request: {
    params: z.object({ email: z.string() }),
  },
  responses: createApiResponse(UsersSchema, "Success"),
});
usersRouter.get("/email/:email", usersController.getByEmail);

//====================================================================================================

usersRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/find`,
  tags: [TAG],
  summary: `Find ${TAG} by query`,
  request: {
    body: {
      content: { "application/json": { schema: FindByQuerySchema } },
    },
  },
  responses: createApiResponse(z.array(FindByQuerySchema), "Success"),
});
usersRouter.post("/find", zodValidation(FindByQuerySchema), usersController.findByQuery);

//====================================================================================================

usersRegistry.registerPath({
  method: "post",
  path: ROUTE,
  tags: [TAG],
  summary: `Create ${TAG}`,
  request: {
    body: {
      content: { "application/json": { schema: RegisterSchema } },
    },
  },
  responses: createApiResponse(RegisterSchema, `${TAG} Created Successfully`),
});
usersRouter.post("/", zodValidation(RegisterSchema), usersController.create);

//====================================================================================================

usersRegistry.registerPath({
  method: "put",
  path: `${ROUTE}/{uuid}`,
  tags: [TAG],
  summary: `Update ${TAG}`,
  request: {
    params: z.object({ uuid: z.string() }),
    body: {
      content: { "application/json": { schema: UpdateUsersSchema } },
    },
  },
  responses: createApiResponse(UpdateUsersSchema, `${TAG} Updated Successfully`),
});
usersRouter.put("/:uuid", zodValidation(UpdateUsersSchema), usersController.update);

//====================================================================================================

usersRegistry.registerPath({
  method: "delete",
  path: `${ROUTE}/bulk`,
  tags: [TAG],
  summary: `Delete ${TAG} in bulk`,
  request: {
    body: {
      content: { "application/json": { schema: z.object({ uuids: z.array(z.string()) }) } },
    },
  },
  responses: createApiResponse(z.null(), `${TAG}s Deleted Successfully`),
});
usersRouter.delete(
  "/bulk",
  zodValidation(z.object({ uuids: z.array(z.string()) })),
  usersController.deleteAll,
);

//====================================================================================================

usersRegistry.registerPath({
  method: "delete",
  path: `${ROUTE}/{uuid}`,
  tags: [TAG],
  summary: `Delete ${TAG}`,
  request: {
    params: z.object({ uuid: z.string() }),
  },
  responses: createApiResponse(z.null(), `${TAG} Deleted Successfully`),
});
usersRouter.delete("/:uuid", usersController.delete);

export default usersRouter;
