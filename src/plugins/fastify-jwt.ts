import fastifyPlugin from "fastify-plugin";
import fastifyJwt from "@fastify/jwt"

const jsonWebToken = fastifyPlugin( async (fastify) => {
  fastify.register(fastifyJwt , { secret: "blessing" })
})

export default jsonWebToken 