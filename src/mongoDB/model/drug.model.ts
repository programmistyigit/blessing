import { model, Schema } from "mongoose";

const drug_schema = new Schema({
  name:{ type: String , required: true },
  amount: { type: Number , default: 0 },
  documentation: { type: String , default: undefined },
  images: [{ type: Schema.Types.ObjectId , ref: "images"}]
})

const drug_model = model("drugs" , drug_schema)

export default drug_model