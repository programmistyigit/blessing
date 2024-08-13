import { FastifyPluginAsync } from "fastify";
import bussinesmenRouter from "./bussinesMen.router";

const router: FastifyPluginAsync = async (fastify , opt) => {
  fastify.get("/" , (request , reply) => ("hello"))

  fastify.register(bussinesmenRouter , { prefix: "/bussinesmen"})
}

export default router