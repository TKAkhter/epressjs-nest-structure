import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { model } from "mongoose";
import { z } from "zod";
import { zodSchema } from "@zodyac/zod-mongoose";

extendZodWithOpenApi(z);

export const UsersSchema = z.object({
  uuid: z.string(),
  name: z.string().min(4, "Name must be at least 4 characters long"),
  username: z.string().min(4, "Username must be at least 4 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  resetToken: z.string().optional(),
});

export const CreateUsersSchema = UsersSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUsersSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters long").optional(),
  username: z.string().min(4, "Username must be at least 4 characters long").optional(),
  email: z.string().email("Invalid email address").optional(),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  updatedAt: z.date().optional(),
  resetToken: z.string().optional(),
});

export type UsersDto = z.infer<typeof UsersSchema>;
export type CreateUsersDto = z.infer<typeof CreateUsersSchema>;
export type UpdateUsersDto = z.infer<typeof UpdateUsersSchema>;

const schema = zodSchema(UsersSchema);
export const UsersModel = model("Users", schema);
