import { model, Schema } from "mongoose";

const average_weight_schema = new Schema({
  autor: { type: Schema.Types.ObjectId , ref: "workers"},
  number_of_chicks: { type: Number , required: true },
  total_weight: { type: Number , required: true },
  value: Number,
  day: Date
})

const average_weight_model = model("average_weights" ,average_weight_schema)

export default average_weight_model


// ortacha ogirlik modeli