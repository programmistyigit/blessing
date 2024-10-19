import { model, Schema } from "mongoose";

const tasks_schema = new Schema({
  taskName: { type: String , required: true},
  taskBudjet: { type: Number, default: 0},
  workerForTask: [{ type: Schema.Types.ObjectId , ref: "workers"}],
  taskProgress: { type: Number , min: 0 , max:100 , default: 0},
})

const taskModel = model("tasks" , tasks_schema)

export default taskModel