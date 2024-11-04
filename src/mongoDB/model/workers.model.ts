import { model, Schema } from "mongoose";

const workers_schema = new Schema({
  login:{ type: String, unique: true , required: true},
    status: { type: String, default: "working", enum: ["working", "not working"] },
    fullName: { type: String, required: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: "permissions" }],
    worker_type: [{ type: Schema.Types.ObjectId, ref: "workerTypes" }],
    phoneNumber: {type: String },
    tasks: [{ type: Schema.Types.ObjectId , ref: "tasks"}] ,
    avatar: {
        type: String,
        required: false,
        validate: {
            validator: (val: String) => {
                try {
                    new URL(val);
                    return true;
                } catch (error) {
                    return false;
                }
            },
            message: "Invalid URL"
        }
    }
}, { timestamps: true });

const workers_model = model("workers", workers_schema);
export default workers_model;