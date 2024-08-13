import { FastifyPluginAsync } from "fastify";
import passwordEditRouter from "./passwordEditRouter";
import businesNameEditRouter from "./businesnameEditRouter";

const settings: FastifyPluginAsync = async (fastify) => {
  fastify.register(passwordEditRouter)
  fastify.register(businesNameEditRouter)
}

export default settings