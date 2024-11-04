import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { businesmens, task, worker } from "../../../../mongoDB/model";
import mongoose from "mongoose";

const taskRouter: FastifyPluginAsync = async (fastify) => {
  const schemaCreateTask: FastifySchema = {
    body: Type.Object({
      taskName: Type.String({ minLength: 3, maxLength: 30 }),
      workerForTask: Type.Array(Type.Required(Type.String({  }))),

    })
  }

  const schemaEdit: FastifySchema = {
    body: Type.Object({
      workers: Type.Optional(
        Type.Array(
          Type.Object({
            _id: Type.String({ format: "uuid" }),
            action: Type.String({})
          })
        )
      ),
      taskName: Type.Optional(Type.String({})),
      _id: Type.Required(Type.String({ format: "uuid" }))
    })
  }
  const deleteSchema: FastifySchema = {
    querystring: Type.Object({
      _id: Type.String()
    })
  }

  void fastify.post("/create", { schema: schemaCreateTask }, async (request, reply) => {
    try {
      const { taskName, workerForTask } = request.body as { taskName: string, workerForTask: string[] }
      if(workerForTask.length == 0){ return reply.code(400).send({ message: "Mas'ul ishchi(lar) qoshilishi zarur!"})}
      const exitingWorkers = await worker.find({ _id: { $in: workerForTask } })
      if (exitingWorkers.length != workerForTask.length) {
        return reply.badRequest("Ishchilar malumotida hatolik aniqlandi!")
      }
      const createTask = await task.create({ taskName, workerForTask })
      await businesmens.findByIdAndUpdate(request.user, { $push: { task: createTask._id } })
      await Promise.all(exitingWorkers.map(worker => worker.updateOne({ $push: { tasks: createTask._id } })))
      return reply.send({ message: "success", ok: true, result: createTask })
    } catch (error) {
      reply.internalServerError("Serverda Kutilmagan Hatolik!")
    }
  })

  fastify.put("/edit", { schema: schemaEdit }, async (request, reply) => {
    try {
      const {worker , _id , taskName} = request.body as { worker?: { _id: string, action: "add"|"rm"}[] , _id: string, taskName?: string}
      
      const exitingId = mongoose.Types.ObjectId.isValid(_id)
      if(!exitingId) return reply.badRequest("Yuborilgan Topshiriq ID si xato ekanligi aniqlandi!")
      
      const exitingTask = await task.findById(_id)
      if(!exitingTask) return reply.badRequest("Topshiriq malumotlar bazasidan topilmadi!");

      if(exitingTask.completed) return reply.badRequest("topshiriq yakunlangan uni ozgartirishning iloji yoq!")

      if(taskName){
        await exitingTask.updateOne({ $set: { taskName }})
      }

      if(worker){
        const pull = worker.filter(e => e.action == "rm" )
        const add = worker.filter(e => e.action == "add")
        
        await exitingTask.updateOne({
          $pull: { workerForTask: { $in: pull } },
          $push: { workerForTask: { $each: add } }
        });
      }
      
      return reply.send({ message: "success", ok: true, result: exitingTask})
    } catch (error) {
      return reply.internalServerError("Serverda Kutilmagan Xatolik!")
    }
  })

  fastify.delete("/delete" , { schema: deleteSchema }, async (request, reply) => {
    try {
      const {_id} = request.query as { _id : string }
      const exitingId = mongoose.Types.ObjectId.isValid(_id)
      if(!exitingId) return reply.badRequest("Yuborilgan Topshiriq ID si xato ekanligi aniqlandi!");

      const exitingTask = await task.findById(_id)
      if(!exitingTask) return reply.badRequest("Topshiriq malumotlar bazasidan topilmadi!");

      if(exitingTask.completed) return reply.badRequest("topshiriq yakunlangan uni o'chirishni iloji yoq!");
      if(exitingTask.taskProgress > 0) return reply.badRequest("Topshiriqni bajarish allaqachon boshlangan , ochirish mumkun emas!")

      await exitingTask.deleteOne()

      return { status: "success" , ok: true }

    } catch (error) {
      return reply.internalServerError("Serverda Kutilmagan Xatolik!")
    }
  })
}

export default taskRouter