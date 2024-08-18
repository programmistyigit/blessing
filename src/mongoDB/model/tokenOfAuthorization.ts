import { model, Schema } from "mongoose";

const tokenOfAuthSchema = new Schema({
  worker_id: { type: Schema.Types.ObjectId , ref: "workers"}
})

const tokenOfAuthorizationModel = model("tokenofauths" , tokenOfAuthSchema)

export default tokenOfAuthorizationModel