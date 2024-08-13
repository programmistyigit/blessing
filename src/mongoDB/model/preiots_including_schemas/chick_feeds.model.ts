import { model, Schema } from "mongoose";

const chick_feeds_schema = new Schema({
  autor: { type: Schema.Types.ObjectId , ref: "workers"},
  value: { type: Number , required: true },
  day: Date ,
  description: String
})

const chick_feeds_model = model("chick_feeds" , chick_feeds_schema)

export default chick_feeds_model

// yem modeli