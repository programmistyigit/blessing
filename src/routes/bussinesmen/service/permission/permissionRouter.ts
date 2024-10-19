import { FastifyPluginAsync } from "fastify";
import { permission_list } from "../../../../constants";

const permissionRouter: FastifyPluginAsync = async (fastify) => {
  fastify.get("/all" , (request, reply) => {
    return { status: "success" , ok: true, result: permission_list }
  })
};

export default permissionRouter