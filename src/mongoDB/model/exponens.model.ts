import { model, Schema } from "mongoose";

const exponens_schema = new Schema({
  description: { type: String , default: undefined },
  exponens_types: { type: Schema.Types.ObjectId , ref: "exponensTypes"}, // xarajat turi nomi
  exponens_value: {
    usd: { type: Number, default: 0 , min: 0 },
    uzs: { type: Number, default: 0 , min: 0 }
  },
  exponens_date: { type: Date , required: true }
})

const exponens_model = model("exponens" , exponens_schema)

export default exponens_model