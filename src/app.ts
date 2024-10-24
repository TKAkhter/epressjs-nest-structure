import path from "node:path";

import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import nocache from "nocache";
import hpp from "hpp";
import { slowDown } from "express-slow-down";
import responseTime from "response-time";
import timeout from "connect-timeout";
import dotenv from "dotenv";
import { apiRoutes } from "./routes/routes";
import { morganStream } from "./common/winston/winston";
import { errorInterceptor } from "./middlewares/error-interceptor";
import { cors } from "./middlewares/cors";
import { authMiddleware } from "./middlewares/auth-middleware";

dotenv.config();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "trusted-scripts.com"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31_536_000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: "same-origin" },
    frameguard: { action: "deny" },
  }),
);

// Additional Security Headers
app.use((_, res: Response, next: NextFunction) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Cross-Domain Policy
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("X-Download-Options", "noopen");

  // Feature Policy
  res.setHeader("Feature-Policy", "geolocation 'none'; microphone 'none'; camera 'none';");

  // Expect-CT Header
  res.setHeader("Expect-CT", "enforce, max-age=30");

  next();
});

// Set the trust proxy to handle X-Forwarded-For correctly
app.set("trust proxy", 1);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});

// Slow down requests from a single IP to prevent abuse
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 1000, // allow 100 requests, then start delaying
  delayMs: (hits) => hits * 500, // add a 500ms delay per request above 1000
});

app.use(limiter);
app.use(speedLimiter);
app.use(hpp());

// Middlewares
app.use(express.json());
app.use(cors);
app.use(cookieParser());
app.use(morgan("dev", { stream: morganStream }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(compression());
app.use(nocache()); // Prevent caching

// Response Time Middleware
app.use(responseTime());

// Timeout Middleware
app.use(timeout((process.env.SERVER_TIMEOUT as string) || "150s")); // Set a 150-second timeout for all routes

app.use((_, res, next) => {
  res.append("Permissions-Policy", "browsing-topics=()");
  next();
});

app.use(authMiddleware);

// Routes
app.post("/api", apiRoutes);

// Custom Error Handler Middleware
app.use(errorInterceptor);

// Catch 404 and forward to error handler
app.use((_: Request, res: any) => {
  return res.status(404).send("Route not found");
});

export default app;
