import { model, Schema } from "mongoose";

const workerTypes_schema = new Schema({
  career: { type: String, required: true , unique: true}, // mansab
  salary: { type: Number, required: true }, // oylik
  salary_type: { type: String , required: true , enum: ["USD" , "UZS"]},
  permissions: [{ type: String }], // rxsatlar
  members: [{ type: Schema.Types.ObjectId , ref: "workers"}] // shu turkumdagi ishchilar
})

const workerTypes_model = model("workerTypes", workerTypes_schema)

export default workerTypes_model