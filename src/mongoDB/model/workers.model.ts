import { model, Schema } from "mongoose";

const workers_schema = new Schema({
  status: { type: String, default: "working", enum: ["working", "dont working"] },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  login: { type: String, required: true, unique: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: "permissions" }],
  worker_type: [{ type: Schema.Types.ObjectId, ref: "workerTypes" }],
  avatar: {
    type: String, default: "null", validate: {
      validator: (val: String) => {
        const cheskUri = new URL(val)
        if (cheskUri.protocol == "https://" || cheskUri.protocol == "http://") {
          return true
        }
        return false
      },
      message: "invalid value"
    }
  }
} , { timestamps: true})

const workers_model = model("workers", workers_schema)
export default workers_model