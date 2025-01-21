import { NextFunction, Response } from "express";
import { FilesService } from "@/entities/files/files.service";
import { UpdateFilesDto, UploadFilesDto } from "@/entities/files/files.dto";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";
import { saveFileToDisk } from "@/common/multer/save-file-to-disk";
import { updateImageToDisk } from "@/common/multer/update-file-to-disk";
import { deleteFileFromDisk } from "@/common/multer/delete-file-from-disk";

const filesService = new FilesService();
export class FilesController {
  async getAllFiles(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { loggedUser } = req;
    try {
      const files = await filesService.getAllFiles();
      res.json(files);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn("Error getting files", { error: error.message, loggedUser });
      }
      next(error);
    }
  }

  async getFileById(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { loggedUser } = req;
    try {
      const file = await filesService.getFileById(id);
      res.json(file);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn("Error getting file", { error: error.message, loggedUser, id });
      }
      next(error);
    }
  }

  async createFile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { loggedUser } = req;
    const { buffer, mimetype } = req.file!;
    const { tags } = req.body;

    try {
      const { fileName, filePath } = await saveFileToDisk(req.file);
      const fileText = `data:${mimetype};base64,${buffer.toString("base64")}`;
      const fileData: UploadFilesDto = { fileName, filePath, fileText, userId: loggedUser!, tags };
      const newFile = await filesService.uploadFiles(fileData);
      res.status(201).json(newFile);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn("Error uploading file", { error: error.message, loggedUser });
      }
      next(error);
    }
  }

  async updateFile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { loggedUser } = req;
    const { id } = req.params;
    const { buffer, mimetype } = req.file!;
    const updateData = req.body;
    try {
      const existFile = await filesService.getFileById(id);
      if (!existFile) {
        throw new Error("File not found");
      }
      const { fileName, filePath } = await updateImageToDisk(existFile.fileName!, req.file);
      const fileText = `data:${mimetype};base64,${buffer.toString("base64")}`;
      const fileData: UpdateFilesDto = {
        fileName,
        filePath,
        fileText,
        userId: loggedUser!,
        ...updateData,
      };
      const updatedFile = await filesService.updateFile(id, fileData);
      res.json(updatedFile);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn("Error updating file", { error: error.message, loggedUser, id });
      }
      next(error);
    }
  }

  async deleteFile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { loggedUser } = req;
    const { id } = req.params;
    try {
      const existFile = await filesService.getFileById(id);
      if (!existFile) {
        throw new Error("File not found");
      }
      await deleteFileFromDisk(existFile.fileName!);
      await filesService.deleteFile(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        logger.warn("Error deleting file", { error: error.message, loggedUser, id });
      }
      next(error);
    }
  }
}
