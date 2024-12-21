import { model, Schema } from "mongoose";

const drug_schema = new Schema({
  name:{ type: String , required: true },
  amount: { type: Number , default: 0 },
  amount_type: {type: String },
  documentation: { type: String , default: undefined },
  image: { type: Schema.Types.ObjectId , ref: "images"},
  key: String,
  warningValue: { type: Number, required: true }
})

const drug_model = model("drugs" , drug_schema)

export default drug_model