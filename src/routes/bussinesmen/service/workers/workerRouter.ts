import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import bson_regExp from "../../../../constants/bson_regExp";
import { worker, permission, worker_types } from "../../../../mongoDB/model";

type CreateWorkerBody = {
  fullname: string;
  password: string;
  login: string;
  worker_type: Array<string>;
  permissions?: Array<string>
}

const workerRouter: FastifyPluginAsync = async (fastify) => {
  const createWorkerSchema: FastifySchema = {
    body: Type.Object({
      fullName: Type.Required(Type.String({ minLength: 5, maxLength: 30 })),
      password: Type.Required(Type.String({ pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$" })),
      login: Type.Required(Type.String({ minLength: 5 })),
      worker_type: Type.Required(Type.Array(Type.String({ pattern: `${bson_regExp}` }))),
      permissions: Type.Optional(Type.Array(Type.String({ pattern: `${bson_regExp}` })))
    })
  }
  const removeWorkerSchema: FastifySchema = {
    querystring: Type.Object({
      _id: Type.String({ pattern: `${bson_regExp}` })
    })
  }
  fastify.post("/create-worker", { schema: createWorkerSchema }, async (request, reply) => {
    try {
      const { permissions, worker_type } = request.body as CreateWorkerBody
      const cheskWorkerType = await worker_types.find({ _id: { $in: worker_type } })
      if (cheskWorkerType.length !== worker_type.length) {
        throw new Error("invalid worker types ID")
      }
      if (permissions) {
        const cheskPermissions = await permission.find({ _id: { $in: permissions } })
        if (cheskPermissions.length !== permissions?.length) throw new Error("Invalid permissions ID")
      }

      const newWorker = await worker.create((request.body as CreateWorkerBody))
      return { status: "success", ok: true, result: { data: newWorker } }
    } catch (error) {
      console.error(error)
      return reply.code(500).send({ status: "error", ok: false, message: error + "" })
    }
  })

  fastify.put("/remove-worker", { schema: removeWorkerSchema }, async (request, reply) => {
    try {
      const {_id} = request.query as {_id:string}
      const cheskWorker = await worker.findById(_id)
      if(!cheskWorker) throw new Error("Worker not found");
      cheskWorker.status = "dont working"
      await cheskWorker.save()
      return { status: "success" , ok: true }
    } catch (error) {
      console.error(error)
      return reply.code(500).send({ status: "error" , ok: false , message: error+""})
    }
  })
}

export default workerRouter