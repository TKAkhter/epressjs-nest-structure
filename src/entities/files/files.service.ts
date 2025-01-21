import { FilesRepository } from "@/entities/files/files.repository";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/common/winston/winston";
import { UpdateFilesDto, UploadFilesDto } from "@/entities/files/files.dto";
import { v4 as uuidv4 } from "uuid";
export class FilesService {
  private filesRepository = new FilesRepository();

  async uploadFiles(fileData: UploadFilesDto) {
    try {
      logger.info("Uploading file metadata to the database", { fileData });
      const fileUpload = {
        ...fileData,
        uuid: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        views: "0",
        userId: "talhaakhter01@gmail.com",
      };
      return await this.filesRepository.createFile(fileUpload);
    } catch (error) {
      logger.warn("Error uploading file metadata", { error });
      throw createHttpError(StatusCodes.INTERNAL_SERVER_ERROR, "Error uploading file metadata.");
    }
  }

  async getFileById(id: string) {
    const file = await this.filesRepository.getFilesById(id);

    if (!file) {
      throw createHttpError(StatusCodes.NOT_FOUND, "File not found.");
    }

    return file;
  }

  async getAllFiles() {
    // eslint-disable-next-line no-return-await
    return await this.filesRepository.getAllFiles();
  }

  async updateFile(id: string, updateData: UpdateFilesDto) {
    const updatedFile = await this.filesRepository.updateFile(id, updateData);

    if (!updatedFile) {
      throw createHttpError(StatusCodes.NOT_FOUND, "File not found.");
    }

    return updatedFile;
  }

  async deleteFile(id: string) {
    const deletedFile = await this.filesRepository.deleteFile(id);

    if (!deletedFile) {
      throw createHttpError(StatusCodes.NOT_FOUND, "File not found.");
    }

    return deletedFile;
  }
}
