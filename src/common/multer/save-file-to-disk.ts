import path from "path";
import fs from "fs";
import { logger } from "@/common/winston/winston";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveFileToDisk = async (file: any) => {
  try {
    const fileBuffer = file.buffer;

    const uploadDir = "./uploads";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    fs.writeFile(filePath, fileBuffer, (err) => {
      if (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger.warn("Error saving file to disk:", err as any);
        throw new Error("Failed to save file.");
      }

      logger.info(`File saved to: ${filePath}`);
    });
    return { fileName, filePath };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.warn("Error saving file:", error);
    throw new Error("Failed to save file.");
  }
};
