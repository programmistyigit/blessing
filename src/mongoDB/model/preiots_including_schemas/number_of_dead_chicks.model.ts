import { model, Schema } from "mongoose";

const number_of_dead_chicks_schema = new Schema({
  periots: { type: Schema.Types.ObjectId, ref: "periots" },
  autor: { type: Schema.Types.ObjectId, ref: "workers" },
  description: { type: String, default: undefined },
  value: { type: Number, default: 0 },
  day: { type: Date, required: true }
})

const number_of_dead_chicks_model = model("number_of_dead_chicks", number_of_dead_chicks_schema)

export default number_of_dead_chicks_model