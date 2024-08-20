import { FastifyPluginAsync } from "fastify";
import { workerLoginRouter, workerServiceRouter } from "./worker";
import { worker } from "../mongoDB/model";

const workerRouter: FastifyPluginAsync = async (fastify) => {
  fastify.register(workerLoginRouter, "/auth")

  fastify.register(async (instance) => {
    instance.addHook("preHandler", async (request, reply) => {
      try {
        const authorization = request.headers["authorization"]
        if (!authorization) throw new Error("invalid authorization");

        const token = authorization.split(" ")[1]
        if (!token) throw new Error("invalid authorization");

        const deToken = instance.jwt.verify<{ _id: string }>(token)
        const exitingWorker = await worker.findById(deToken._id)
        if (!exitingWorker) throw new Error("invalid token");

        request.user = exitingWorker._id.toString()

      } catch (error: any) {
        console.error(error);
        if (error.message) {
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

    instance.register(workerServiceRouter , { prefix: "/service"})
  })
}

export default workerRouter