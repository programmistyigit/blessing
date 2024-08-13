import { model, Schema } from "mongoose";

const medical_drug_schema = new Schema({
  autor: { type: Schema.Types.ObjectId , ref: "workers"},
  drug: { type: Schema.Types.ObjectId , ref: "drugs"},
  ammount: { type: Number , required: true },
  description: String,
  day: { type: Date , required: true }
})

const medical_drug_model = model("medical_drugs" , medical_drug_schema)

export default medical_drug_model