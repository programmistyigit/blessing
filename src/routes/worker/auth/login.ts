import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { tokenOfAuthorization, worker } from "../../../mongoDB/model";
import mongoose from "mongoose";
import _ from "lodash";

type Body = { token: string }
type ValidateTokenReturnData = {
  data: { _id: string },
}

const workerLoginRouter: FastifyPluginAsync = async (fastify) => {
  const schema: FastifySchema = {
    body: Type.Object({
      token: Type.String()
    })
  }

  const validateToken = async (token: string): Promise<ValidateTokenReturnData> => {
    const deToken = fastify.jwt.verify<{ _id: string }>(token)

    const isValidId = mongoose.Types.ObjectId.isValid(deToken._id)
    if (!isValidId) throw new Error("Invalid mongoose Id");

    const getWorker = await tokenOfAuthorization.findById(deToken._id)
    if (!getWorker) throw new Error("wendor not found");

    await getWorker.populate({ path: "worker_id", strictPopulate: true })
    if(!getWorker.worker_id) throw new Error("invalid document")

    return { data: { _id: getWorker.worker_id.toString() } }
  }

  fastify.post("/login", { schema }, async (request, reply) => {
    try {
      const { token } = request.body as Body
      const { data:{ _id } } = await validateToken(token)
      
      const isValidId = mongoose.Types.ObjectId.isValid(_id)
      if(!isValidId) throw new Error("invalid worker ID");

      const workerData = await worker.findById(_id)
      if(!workerData) throw new Error ("worker not found");
      const workerAuthToken = fastify.jwt.sign(_.pick(workerData , ["_id"]))
      return reply
        .code(200)
        .send(
          {
            status: "success",
            ok: true,
            result: {
              token: workerAuthToken
            }
          }
        )

    } catch (error:any) {
      console.error(error);
      if(error.message){
        return reply
          .code(400)
          .send(
            {
              status: "error",
              ok: false,
              message: error.message
            }
          )
      }

      return reply.internalServerError("Internal server error")
    }
  })
}

export default workerLoginRouter