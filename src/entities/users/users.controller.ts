import { NextFunction, Response } from "express";
import { UsersService } from "@/entities/users/users.service";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";
import { csvBufferToJson, csvToJson } from "@/utils/csv-to-json";
import { createResponse } from "@/utils/create-response";

export class UsersController {
  public collectionName: string;
  public logFileName: string;
  public usersService: UsersService;

  constructor() {
    this.collectionName = "users";
    this.logFileName = `[${this.collectionName} Controller]`;
    this.usersService = new UsersService(this.collectionName, `[${this.collectionName} Service]`);
  }

  /**
   * Get all entities objects
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON list of entities
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      logger.info(`${this.logFileName} Fetching all ${this.collectionName}`);
      const data = await this.usersService.getAll();

      return res.json(createResponse(req, data));
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching all ${this.collectionName}`, {
          error: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * Get entity by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON entity object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getById = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} by ID`, { user, id });
      const data = await this.usersService.getById(id);
      return res.json(createResponse(req, data));
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.collectionName} by ID`, {
          error: error.message,
          user,
          id,
        });
      }
      next(error);
    }
  };

  /**
   * Get entity by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON entity object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getByUuid = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { uuid } = req.params;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} by uuid`, { user, uuid });
      const data = await this.usersService.getByUuid(uuid);
      return res.json(createResponse(req, data));
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.collectionName} by uuid`, {
          error: error.message,
          user,
          uuid,
        });
      }
      next(error);
    }
  };

  /**
   * Get entity by email
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON entity object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getByEmail = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { email } = req.params;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} by email`, { user, email });
      const data = await this.usersService.getByEmail(email);
      return res.json(createResponse(req, data));
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.collectionName} by email`, {
          error: error.message,
          user,
          email,
        });
      }
      next(error);
    }
  };

  /**
   * Find entities by query (pagination, sorting, filtering)
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON result of the query
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findByQuery = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { paginate, orderBy, filter } = req.body;
      const queryOptions = { paginate, orderBy, filter };
      logger.info(`${this.logFileName} Finding ${this.collectionName} by query`, { queryOptions });

      const result = await this.usersService.findByQuery(queryOptions);
      return res.json(createResponse(req, result));
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error finding ${this.collectionName} by query`, {
          error: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * Create a new entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON created entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const createDto = req.body;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Creating new ${this.collectionName}`, { user, createDto });
      const created = await this.usersService.create(createDto);
      return res.json(
        createResponse(req, created, "User created successfully", StatusCodes.CREATED),
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error creating ${this.collectionName}`, {
          error: error.message,
          user,
          createDto,
        });
      }
      next(error);
    }
  };

  /**
   * Update an existing entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON updated entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { uuid } = req.params;
    const updateDto = req.body;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Updating ${this.collectionName}`, { user, uuid, updateDto });
      const updatedData = await this.usersService.update(uuid, updateDto);
      return res.json(createResponse(req, updatedData, "User updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error updating ${this.collectionName}`, {
          error: error.message,
          user,
          uuid,
          updateDto,
        });
      }
      next(error);
    }
  };

  /**
   * Delete a entity by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON success message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { uuid } = req.params;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Deleting ${this.collectionName} by uuid`, { user, uuid });
      await this.usersService.delete(uuid);
      return res.json(createResponse(req, {}, "User deleted Successfully"));
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error deleting ${this.collectionName}`, {
          error: error.message,
          user,
          uuid,
        });
      }
      next(error);
    }
  };

  /**
   * Delete multiple entities
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON success message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { uuids } = req.body;
    const { user } = req;
    try {
      if (!Array.isArray(uuids) || uuids.length === 0) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid or empty array of uuids", {
          resource: this.collectionName,
        });
      }

      logger.info(`${this.logFileName} Deleting multiple ${this.collectionName}`, { user, uuids });
      const result = await this.usersService.deleteAll(uuids);

      return res.json(
        createResponse(
          req,
          {},
          `${result.deletedCount} ${this.collectionName} deleted successfully`,
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error deleting ${this.collectionName}`, {
          error: error.message,
          user,
          uuids,
        });
      }
      next(error);
    }
  };

  /**
   * Import entities
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON created entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { user, file } = req;
    if (!file) {
      return next(createHttpError(StatusCodes.BAD_REQUEST, "No file uploaded."));
    }
    try {
      logger.info(`${this.logFileName} Importing new ${this.collectionName}`, { user });
      let importEntries;

      if (file.buffer) {
        importEntries = await csvBufferToJson(file.buffer);
      } else {
        importEntries = await csvToJson(file.path);
      }

      const imported = await this.usersService.import(importEntries);

      return res.json(
        createResponse(
          req,
          imported.createdEntities,
          `${imported.createdCount} completed, ${imported.skippedCount} skipped`,
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error creating ${this.collectionName}`, {
          error: error.message,
          user,
        });
      }
      next(error);
    }
  };

  /**
   * Export entities
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON list of entities
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export = async (_req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      logger.info(`${this.logFileName} Exporting ${this.collectionName}`);
      const csv = await this.usersService.export();
      res.header("Content-Type", "text/csv");
      res.header("Content-Disposition", "attachment; filename=accounts.csv");
      res.send(csv);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error exporting ${this.collectionName}`, {
          error: error.message,
        });
      }
      next(error);
    }
  };
}
