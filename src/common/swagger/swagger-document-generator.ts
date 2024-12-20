import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { env } from "../../config/env";
import { healthCheckRegistry } from "../../entities/health-check/health-check";
import { userRegistry } from "../../entities/user/user.route";
import { authRegistry } from "../../entities/auth/auth.route";
import { fileRegistry } from "../../entities/file/file.route";

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    userRegistry,
    authRegistry,
    fileRegistry,
  ]);

  registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      version: "1.0.0",
      title: "Swagger API",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      termsOfService: "http://swagger.io/terms/",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
    servers: [
      {
        url: `${env.BASE_URL}/api`,
        description: "http protocol",
      },
      {
        url: `${env.BASE_URL_HTTPS}/api`,
        description: "https protocol",
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  });
}
