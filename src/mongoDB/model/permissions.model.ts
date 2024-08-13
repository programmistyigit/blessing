import { model, Schema } from "mongoose";

const permissions_schema = new Schema({
  keywords: String,
  permission:String,
  label:String  
})

const permissions_model = model("permissions" , permissions_schema)

export default permissions_model
