import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import bson_regExp from "../../../../constants/bson_regExp";
import { worker, tokenOfAuthorization } from "../../../../mongoDB/model";
import _ from "lodash";

const createUniqueKey: FastifyPluginAsync = async (fastify) => {
  const schema: FastifySchema = {
    querystring: Type.Object({
      _id: Type.String({ pattern: `${bson_regExp}`})
    })
  }

  void fastify.get("/unique-key-for-workers" , {schema}, async (request, reply) => {
    try {
      const {_id} = request.query as { _id: string};
      const exitingWorker = await worker.findById(_id);
      if(!exitingWorker) throw new Error("worker not found");

      const createAuthorization = await tokenOfAuthorization.create({ worker_id: _id })
      const key = fastify.jwt.sign(_.pick(createAuthorization , ["_id"]))

      return { status: "success" , ok: true , result: { key }};
    } catch (error:any) {
      if(error.message){
        return reply.code(400).send({ status: "error" , ok: false, message: error.message })
      }
      return reply.internalServerError("Internal server error")
    }
  })
}

export default createUniqueKey