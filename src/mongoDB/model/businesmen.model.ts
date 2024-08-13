import { model, Schema } from "mongoose";

const businessmenSchema = new Schema({
  business_name: {type: String , default: "exomple name"},
  login: { type: String, unique: true , required: true },
  password: { type:String , required: true },
  business_space: [{ type: Schema.Types.ObjectId , ref: "business_spaces" }], //biznes tochkalar 
  all_workers:[{ type: Schema.Types.ObjectId , ref: "workers"}], // barcha ishchilari
  deposite: {    // boshlang'ich mablag
    deposite_Sum: { type: Number , default: 0 , min: 0},
    deposite_Usd: { type: Number , default: 0 , min: 0}
  },
  othersExponens:[{ type: Schema.Types.ObjectId , ref: "exponens"}], // boshqa harajatlar
  salary_expenses: [{ type: Schema.Types.ObjectId , ref: "exponens"}], // oylik harajatlari
  periots: [{ type: Schema.Types.ObjectId , ref: "periots" }],
  current_periot: { type: Schema.Types.ObjectId , ref: "periots" },
})


const business_model = model("businesmens" , businessmenSchema)
export default business_model