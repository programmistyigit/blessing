import { FastifyPluginAsync } from "fastify";
import { workerLoginRouter } from "./worker";

const workerRouter: FastifyPluginAsync = async (fastify) => {
  fastify.register(workerLoginRouter , "/auth")
}

export default workerRouter