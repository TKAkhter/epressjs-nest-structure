import { NextFunction, Response } from "express";
import { AuthDto, RegisterDto, ResetPasswordDto } from "@/entities/auth/auth.dto";
import { AuthService } from "@/entities/auth/auth.services";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";

export class AuthController {
  private logFileName: string;
  private authService: AuthService;

  constructor() {
    this.logFileName = "[Auth Controller]";
    this.authService = new AuthService("[Auth Service]");
  }

  /**
   * Handles user login by verifying credentials and returning a token.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  login = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const loginDto: AuthDto = req.body;
    const { loggedUser } = req;
    logger.info(`${this.logFileName} login API invoked`, { email: loginDto.email, loggedUser });

    try {
      const result = await this.authService.login(loginDto);
      logger.info(`${this.logFileName} User login successful`, {
        email: loginDto.email,
        loggedUser,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`${this.logFileName} login API error`, {
          email: loginDto.email,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(`${this.logFileName} login API error: Unknown error occurred`, { loggedUser });
      }
      next(error);
    }
  };

  /**
   * Handles user registration by creating a new user and returning the registered user details.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  register = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const registerDto: RegisterDto = req.body;
    const { loggedUser } = req;
    logger.info(`${this.logFileName} Register API invoked`, {
      email: registerDto.email,
      loggedUser,
    });

    try {
      const result = await this.authService.register(registerDto);
      logger.info(`${this.logFileName} User registration successful`, {
        email: registerDto.email,
        loggedUser,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Register API error`, {
          email: registerDto.email,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(`${this.logFileName} Register API error: Unknown error occurred`, {
          loggedUser,
        });
      }
      next(error);
    }
  };

  /**
   * Handles user logout by invalidating the user's token.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  logout = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    const { loggedUser } = req;
    logger.info(`${this.logFileName} Logout API invoked`, { token, loggedUser });

    try {
      const result = await this.authService.logout(token!);
      logger.info(`${this.logFileName} User logout successful`, { token, loggedUser });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Logout API error`, {
          token,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(`${this.logFileName} Logout API error: Unknown error occurred`, { loggedUser });
      }
      next(error);
    }
  };

  /**
   * Extends the user's token and returns a new token.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  extendToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    const { loggedUser } = req;
    logger.info(`${this.logFileName} ExtendToken API invoked`, { token, loggedUser });

    try {
      const newToken = await this.authService.extendToken(token!);
      logger.info(`${this.logFileName} Token extended successfully`, { newToken, loggedUser });
      res.json({ token: newToken });
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`${this.logFileName} ExtendToken API error`, {
          token,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(`${this.logFileName} ExtendToken API error: Unknown error occurred`, {
          loggedUser,
        });
      }
      next(error);
    }
  };

  /**
   * Initiates the forgot password process for a user.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  forgotPassword = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;
    const { loggedUser } = req;
    logger.info(`${this.logFileName} Forgot password API invoked`, { email, loggedUser });

    try {
      const message = await this.authService.forgotPassword(email);
      logger.info(`${this.logFileName} Forgot password successful`, {
        email,
        loggedUser,
      });
      res.json(message);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Forgot password API error`, {
          email,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(`${this.logFileName} Forgot password API error: Unknown error occurred`, {
          loggedUser,
        });
      }
      next(error);
    }
  };

  /**
   * Initiates the reset password process for a user.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  resetPassword = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { resetToken, password, confirmPassword } = req.body;
    const { loggedUser } = req;
    logger.info(`${this.logFileName} Reset password API invoked`, { resetToken, loggedUser });

    const resetPasswordDto: ResetPasswordDto = {
      password: password as string,
      confirmPassword: confirmPassword as string,
      resetToken: resetToken as string,
    };
    try {
      const message = await this.authService.resetPassword(resetPasswordDto);
      logger.info(`${this.logFileName} Reset password successful`, {
        resetToken,
        loggedUser,
      });
      res.json(message);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`${this.logFileName} Reset password API error`, {
          resetToken,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(`${this.logFileName} Reset password API error: Unknown error occurred`, {
          loggedUser,
        });
      }
      next(error);
    }
  };
}
