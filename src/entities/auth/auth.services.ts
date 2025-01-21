import { compare, hash } from "bcrypt";
import { logger } from "@/common/winston/winston";
import { AuthDto, RegisterDto, ResetPasswordDto } from "@/entities/auth/auth.dto";
import { generateToken, verifyToken } from "@/common/jwt/jwt";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { UsersService } from "@/entities/users/users.service";
import { sendMail } from "@/common/mail-sender/mail-sender";
import { GenericRepository } from "@/common/repository";
import { CreateUsersDto, UpdateUsersDto, UsersDto, UsersModel } from "../users/users.dto";
import { env } from "@/config/env";
import { createTemplate } from "@/template/create-template";

export class AuthService {
  private collectionName: string;
  private logFileName: string;
  private usersService: UsersService;
  private usersRepository: GenericRepository<UsersDto, UpdateUsersDto, CreateUsersDto>;

  constructor(logFileName: string) {
    this.collectionName = "user";
    this.logFileName = logFileName;
    this.usersService = new UsersService(this.collectionName, `[${this.collectionName} Service]`);
    this.usersRepository = new GenericRepository(UsersModel, `[${this.collectionName} Repository]`);
  }

  /**
   * Handles user login by verifying the credentials and generating a token.
   * @param authData - Object containing user login credentials.
   * @returns Object containing the generated token.
   * @throws HTTP error if user not found or password is invalid.
   */
  login = async (authData: AuthDto) => {
    logger.info(`${this.logFileName} login service invoked`, { email: authData.email });

    try {
      const user = await this.usersService.getByEmail(authData.email);

      if (!user) {
        logger.warn(`${this.logFileName} ${this.collectionName} not found during login`, {
          email: authData.email,
        });
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.collectionName} does not exist!`, {
          resource: "Auth",
        });
      }

      if (!(await compare(authData.password, user.password as string))) {
        logger.warn(`${this.logFileName} Invalid password during login`, {
          email: authData.email,
        });
        throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid email or password", {
          resource: "Auth",
        });
      }

      const token = generateToken({
        id: user.uuid,
        username: user.username,
        name: user.name,
        email: user.email,
      });

      logger.info(`${this.logFileName} Token received successfully`, { email: authData.email });
      return { user, token };
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Error during login`, {
          error: error.message,
          email: authData.email,
        });
        throw new Error(`Error while login: ${error.message}`);
      }
      logger.warn(`${this.logFileName} Unknown error during login`, { email: authData.email });
      throw new Error("Unknown error occurred while login");
    }
  };

  /**
   * Registers a new user and generates a token for the user.
   * @param registerDto - Registration data for a new user.
   * @returns Object containing the registered user and generated token.
   * @throws HTTP error if user already exists.
   */
  register = async (registerDto: RegisterDto) => {
    logger.info(`${this.logFileName} Register service invoked`, { email: registerDto.email });

    try {
      const user = await this.usersService.getByEmail(registerDto.email);

      if (user) {
        logger.warn(
          `${this.logFileName} ${this.collectionName} already exists during registration`,
          {
            email: registerDto.email,
          },
        );
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.collectionName} already exist!`, {
          resource: "Auth",
        });
      }

      await this.usersService.create(registerDto);

      const login = await this.login(registerDto);

      logger.info(`${this.logFileName} ${this.collectionName} registered successfully`, {
        email: registerDto.email,
      });
      return login;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Error during registration`, {
          error: error.message,
          email: registerDto.email,
        });
        throw new Error(`${this.logFileName} Error while login: ${error.message}`);
      }
      logger.warn(`${this.logFileName} Unknown error during registration`, {
        email: registerDto.email,
      });
      throw new Error(`${this.logFileName} Unknown error occurred while login`);
    }
  };

  /**
   * Extends the user's token and returns a new token.
   * @param token - The current token to extend.
   * @returns The newly extended token.
   * @throws Error if token extension fails.
   */
  extendToken = async (token: string) => {
    logger.info(`${this.logFileName} Extend token service invoked`, { token });

    try {
      const payload = verifyToken(token);
      const newToken = generateToken({
        id: payload.id,
        username: payload.username,
        name: payload.name,
        email: payload.email,
      });
      logger.info(`${this.logFileName} Token extended successfully`, { newToken });
      return newToken;
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Error extending token`, { error: error.message, token });
        throw new Error(`${this.logFileName} Error extend token: ${error.message}`);
      }
      logger.warn(`${this.logFileName} Unknown error while extending token`, { token });
      throw new Error(`${this.logFileName} Unknown error occurred while extend token`);
    }
  };

  /**
   * Logs out the user by invalidating the token.
   * @param token - The token to invalidate.
   * @returns Object with the invalidated token and success status.
   * @throws Error if logout fails.
   */
  logout = async (token: string) => {
    logger.info(`${this.logFileName} Logout service invoked`, { token });

    try {
      return { token, success: true };
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Error during logout`, { error: error.message, token });
        throw new Error(`Error logout: ${error.message}`);
      }
      logger.warn(`${this.logFileName} Unknown error during logout`, { token });
      throw new Error("Unknown error occurred while logout");
    }
  };

  /**
   * Initiates the forgot password process for a user.
   * @param email User's email address
   * @returns message that email sent.
   * @throws HTTP error if any error occur.
   */
  forgotPassword = async (email: string) => {
    logger.info(`${this.logFileName} Forgot password service invoked`, { email });

    try {
      const user = await this.usersService.getByEmail(email);

      if (!user) {
        logger.warn(`${this.logFileName} ${this.collectionName} does not exists!`, {
          email,
        });
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.collectionName} does not exist!`, {
          resource: "Auth",
        });
      }

      const resetToken = generateToken({
        id: user.uuid,
        username: user.username,
        name: user.name,
        email: user.email,
      });

      await this.usersService.update(user.uuid, { resetToken });

      // Send email
      try {
        const context = {
          accountName: user.name,
          URL: `${env.APP_URL}/reset-password?token=${resetToken}`,
        };

        const options = {
          from: `${env.MAILGUN_NAME} <${env.MAILGUN_SENDER_EMAIL}>`,
          to: email,
          subject: "Reset Password Requested",
          html: createTemplate("forgot-password", context),
        };

        await sendMail(options);
      } catch (error) {
        console.log(`Error: ${error}`);
        throw new Error(`Error while sending email: ${error}`);
      }

      logger.info(`${this.logFileName} Email reset link successfully sent`, { email, resetToken });
      return { message: "Reset link sent. Check your inbox" };
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Error during registration`, {
          error: error.message,
          email,
        });
        throw new Error(`${this.logFileName} Error while forgot password: ${error.message}`);
      }
      logger.warn(`${this.logFileName} Unknown error during registration`, {
        email,
      });
      throw new Error(`${this.logFileName} Unknown error occurred while forgot password`);
    }
  };

  resetPassword = async (resetPasswordDto: ResetPasswordDto) => {
    logger.info(`${this.logFileName} reset password service invoked`, {
      resetToken: resetPasswordDto.resetToken,
    });

    try {
      const user = await this.usersRepository.getByField("resetToken", resetPasswordDto.resetToken);

      if (!user) {
        logger.warn(`${this.logFileName} ${this.collectionName} does not exists!`, {
          resetToken: resetPasswordDto.resetToken,
        });
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.collectionName} does not exist!`, {
          resource: "Auth",
        });
      }

      if (!user.resetToken || resetPasswordDto.resetToken !== user.resetToken) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid or expired reset token.");
      }

      const hashedPassword = await hash(resetPasswordDto.password, env.HASH!);

      await this.usersRepository.update(user.uuid, {
        password: hashedPassword,
        resetToken: undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      logger.info(`${this.logFileName} Password reset successful`, {
        resetToken: resetPasswordDto.resetToken,
      });
      return { message: "Password reset successful" };
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Error during registration`, {
          error: error.message,
          resetToken: resetPasswordDto.resetToken,
        });
        throw new Error(`${this.logFileName} Error while reset password: ${error.message}`);
      }
      logger.warn(`${this.logFileName} Unknown error during registration`, {
        resetToken: resetPasswordDto.resetToken,
      });
      throw new Error(`${this.logFileName} Unknown error occurred while reset password`);
    }
  };
}
