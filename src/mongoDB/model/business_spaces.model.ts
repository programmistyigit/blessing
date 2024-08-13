import { model, Schema } from "mongoose";

const business_spaces_schema = new Schema({
  description: { type: String, default: undefined },
  name: { type: String, required: true, unique:true },
  workers: [{ type: Schema.Types.ObjectId, ref: "workers" }], // ishchilar
  status: { type: String, default: "kutilmoqda", enum: ["jarayonda", "kutilmoqda", "tozalanmoqda", "removing"] }, // holati
})

const business_spaces = model("business_spaces", business_spaces_schema)
export default business_spaces