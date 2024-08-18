import { FastifyPluginAsync } from "fastify";
import bussinesmenRouter from "./bussinesMen.router";
import workerRouter from "./workerRouter";

const router: FastifyPluginAsync = async (fastify , opt) => {
  fastify.get("/" , (request , reply) => ("hello"))

  fastify.register(bussinesmenRouter , { prefix: "/bussinesmen"})
  fastify.register(workerRouter , { prefix: "/worker"})
}

export default router