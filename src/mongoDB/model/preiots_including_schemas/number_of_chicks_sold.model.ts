import { model, Schema } from "mongoose";

const number_of_chicks_sold_schema =new Schema({
  periot: { type: Schema.Types.ObjectId , ref: "periots"},
  autor: { type: Schema.Types.ObjectId , ref: "workers"},
  description: { type: String , default: undefined },
  count: { type: Number , default: 0 },
  weight: { type: Number , default: 0 },
  day: { type: Date, required: true },
  average_weight: { type: Number , default: 0 },
  keyword: { type: String , default: undefined}
})

const number_of_chicks_sold_model = model("number_of_chicks_solds" , number_of_chicks_sold_schema)

export default number_of_chicks_sold_model