import { Router } from "express";
import authRouter from "@/entities/auth/auth.route";
import usersRouter from "@/entities/users/users.route";
import filesRouter from "@/entities/files/files.route";
import healthRouter from "@/entities/health/health.route";

export const apiRoutes = Router();

apiRoutes.use("/health", healthRouter);
apiRoutes.use("/auth", authRouter);
apiRoutes.use("/users", usersRouter);
apiRoutes.use("/files", filesRouter);
