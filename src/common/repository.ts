import { Model, UpdateQuery, SortOrder, RootFilterQuery } from "mongoose";
import { FindByQueryDto } from "@/schemas/find-by-query";
import { logger } from "@/common/winston/winston";
import { mongoDbApplyFilter } from "@/utils/mongodb-apply-filter";

const IGNORE_FIELDS = { password: 0 };
export class GenericRepository<T, TCreateDto, TUpdateDto> {
  private model: Model<T>;
  private logFileName: string;

  constructor(model: Model<T>, logFileName: string) {
    this.logFileName = logFileName;
    this.model = model;
  }

  /**
   * Fetches all entities from the collection.
   * @returns Array of entities
   */
  getAll = async (): Promise<T[]> => {
    try {
      logger.info(`${this.logFileName} Fetching all from ${this.model.modelName}`);
      return await this.model.find({}, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error fetching all from ${this.model.modelName}`, {
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Fetches an entity by ID.
   * @param id - Entity's unique identifier
   * @returns Entity data or null if not found
   */
  getById = async (id: string): Promise<T | null> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.model.modelName} with id: ${id}`);
      return await this.model.findById(id, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error fetching ${this.model.modelName} by id`, {
        id,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Fetches a entity by their id.
   * @param uuid - entity's unique identifier
   * @returns entity data or null if not found
   */
  getByUuid = async (uuid: string): Promise<T | null> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.model.modelName} with uuid: ${uuid}`);
      return await this.model.findOne({ uuid }, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error fetching ${this.model.modelName} by uuid`, {
        uuid,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Fetches a entity by their email.
   * @param email - entity's email
   * @returns entity data or null if not found
   */
  getByEmail = async (email: string): Promise<T | null> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.model.modelName} with email: ${email}`);
      return await this.model.findOne({ email }, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error fetching ${this.model.modelName} by email`, {
        email,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Fetches a entity by their username.
   * @param username - entity's username
   * @returns entity data or null if not found
   */
  getByUsername = async (username: string): Promise<T | null> => {
    try {
      logger.info(
        `${this.logFileName} Fetching ${this.model.modelName} with username: ${username}`,
      );
      return await this.model.findOne({ username }, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error fetching ${this.model.modelName} by username`, {
        username,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Fetches a document based on a specified field and its value.
   * @param field - The field name to search by.
   * @param value - The value to match for the specified field.
   * @returns The matched document or null if not found.
   */
  getByField = async (field: string, value: string | number): Promise<T | null> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.model.modelName} where ${field}: ${value}`);
      const query = { [field]: value };
      return await this.model.findOne(query as RootFilterQuery<T>, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error fetching ${this.model.modelName} by ${field}`, {
        field,
        value,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Finds entities with pagination.
   * @param options - Query options
   * @returns Paginated data
   */
  findByQuery = async (options: FindByQueryDto) => {
    const { filter = {}, paginate = { page: 1, perPage: 10 }, orderBy = [] } = options;

    const { page, perPage } = paginate;

    try {
      // Build the sort object for MongoDB
      const sortOptions = orderBy.reduce(
        (acc, { sort, order }) => {
          acc[sort] = order;
          return acc;
        },
        {} as Record<string, SortOrder>,
      );

      // Convert the filter for MongoDB
      const mongoFilter = mongoDbApplyFilter(filter);

      // Query the collection
      const [data, total] = await Promise.all([
        this.model
          .find(mongoFilter, IGNORE_FIELDS)
          .sort(sortOptions)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec(),
        this.model.countDocuments(mongoFilter),
      ]);

      return {
        data,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error querying ${this.model.modelName}`, {
        options,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Creates a new entity.
   * @param createDto - Data for creating a new entity
   * @returns Created entity data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create = async (createDto: TCreateDto): Promise<any> => {
    try {
      logger.info(`${this.logFileName} Creating document in ${this.model.modelName}`);
      const created = new this.model(createDto);
      await created.save();
      return this.getById(created.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error creating entry in ${this.model.modelName}`, {
        createDto,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Updates an existing entity.
   * @param uuid - Entity's unique identifier
   * @param updateDto - Data to update the entity
   * @returns Updated entity data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update = async (uuid: string, updateDto: TUpdateDto): Promise<any> => {
    try {
      logger.info(`${this.logFileName} Updating ${this.model.modelName} with uuid: ${uuid}`);
      return await this.model.findOneAndUpdate({ uuid }, updateDto as UpdateQuery<T>, {
        new: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error updating ${this.model.modelName}`, {
        uuid,
        updateDto,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Deletes an entity by uuid.
   * @param uuid - Entity's unique identifier
   * @returns Deleted entity data
   */
  delete = async (uuid: string): Promise<T | null> => {
    try {
      logger.info(`${this.logFileName} Deleting ${this.model.modelName} with uuid: ${uuid}`);
      return await this.model.findOneAndDelete({ uuid });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error deleting ${this.model.modelName}`, {
        uuid,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Deletes multiple entities by their uuids.
   * @param uuids - List of entity uuids to delete
   * @returns Deletion result
   */
  async deleteAll(uuids: string[]): Promise<{ deletedCount: number }> {
    try {
      return await this.model.deleteMany({ uuid: { $in: uuids } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error deleting multiple ${this.model.modelName}`, {
        uuids,
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Imports multiple entity objects into the database.
   * Skips objects where email or username already exist in the database.
   * @param entities - Array of entity objects to be saved
   * @returns Object containing created entities, created count, and skipped count
   */
  import = async (
    entities: TCreateDto[],
  ): Promise<{
    createdEntities: T[];
    createdCount: number;
    skippedCount: number;
  }> => {
    try {
      logger.info(
        `${this.logFileName} Importing ${entities.length} documents into ${this.model.modelName}`,
      );
      const uniqueEntities = [];
      const skippedEntities = [];

      for (const entity of entities) {
        // eslint-disable-next-line no-await-in-loop
        const exists = await this.model.exists({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $or: [{ email: (entity as any).email }, { username: (entity as any).username }],
        });

        if (exists) {
          logger.info(
            `${this.logFileName} Email or username already exist in ${this.model.modelName}`,
          );
          skippedEntities.push(entity);
        } else {
          uniqueEntities.push(entity);
        }
      }

      // Insert unique entities into the database
      const createdEntities = (await this.model.insertMany(uniqueEntities, {
        ordered: true,
      })) as unknown as T[];

      const createdCount = createdEntities.length;
      const skippedCount = skippedEntities.length;

      logger.info(`${this.logFileName} Import Summary:`, {
        createdCount,
        skippedCount,
        createdEntities,
      });

      return {
        createdEntities,
        createdCount,
        skippedCount,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`${this.logFileName} Error importing into ${this.model.modelName}`, {
        totalEntities: entities.length,
        error: error.message,
      });
      throw new Error(error);
    }
  };
}
