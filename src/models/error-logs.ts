import { env } from "@/config/env";
import mongoose, { Document, Schema } from "mongoose";

export interface ErrorLogs extends Document {
  level: string;
  message: string;
  timestamp: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}

const ErrorLogsSchema: Schema = new Schema(
  {
    level: { type: String },
    message: { type: String },
    timestamp: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    strict: false,
  },
);

export default mongoose.model<ErrorLogs>(env.NODE_ENV, ErrorLogsSchema);
