import { model, Schema } from "mongoose";

const image_schema = new Schema({
  url: { type: String , required: true }
})

const image_model = model("images" , image_schema)

export default image_model