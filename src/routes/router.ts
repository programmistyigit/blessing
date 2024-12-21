import { FastifyPluginAsync } from "fastify";
import bussinesmenRouter from "./bussinesMen.router";
import workerRouter from "./workerRouter";
import { mediaRouter } from "./public";

const router: FastifyPluginAsync = async (fastify , opt) => {
  fastify.get("/" , (request , reply) => ("hello"))

  fastify.register(bussinesmenRouter , { prefix: "/bussinesmen"})
  fastify.register(workerRouter , { prefix: "/worker"})

  fastify.register(mediaRouter , { prefix: "/media"})
}

export default router