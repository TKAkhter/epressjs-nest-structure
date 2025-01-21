import { AuthSchema, RegisterSchema } from "@/entities/auth/auth.dto";

describe("Auth Validation", () => {
  describe("Login Schema", () => {
    it("should pass with valid email and password", async () => {
      const validData = { email: "test@example.com", password: "Password123!" };
      await expect(AuthSchema.parseAsync(validData)).resolves.toEqual(validData);
    });

    it("should fail with missing email", async () => {
      const invalidData = { password: "Password123!" };
      try {
        await AuthSchema.parseAsync(invalidData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        expect(err.errors).toEqual([
          {
            code: "invalid_type",
            expected: "string",
            received: "undefined",
            path: ["email"],
            message: "Required",
          },
        ]);
      }
    });

    it("should fail with invalid email format", async () => {
      const invalidData = { email: "not-an-email", password: "Password123!" };
      try {
        await AuthSchema.parseAsync(invalidData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        expect(err.errors).toEqual([
          {
            code: "invalid_string",
            validation: "email",
            path: ["email"],
            message: "Invalid email",
          },
        ]);
      }
    });

    describe("Register Schema", () => {
      it("should pass with valid email, password, and confirmPassword", async () => {
        const validData = {
          email: "test@example.com",
          name: "Test User",
          username: "testuser",
          password: "Password123!",
          confirmPassword: "Password123!",
        };
        await expect(RegisterSchema.parseAsync(validData)).resolves.toEqual(validData);
      });

      it("should fail when passwords do not match", async () => {
        const invalidData = {
          email: "test@example.com",
          name: "Test User",
          username: "testuser",
          password: "Password123!",
          confirmPassword: "DifferentPassword!",
        };
        try {
          await RegisterSchema.parseAsync(invalidData);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          expect(err.errors).toEqual([
            {
              code: "custom",
              path: ["confirmPassword"],
              message: "Passwords don't match",
            },
          ]);
        }
      });
    });
  });
});
