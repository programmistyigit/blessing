import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { businesmens } from "../../../mongoDB/model";

const businesNameEditRouter: FastifyPluginAsync = async (fastify) => {
  const schema: FastifySchema = {
    body: Type.Object({
      business_name: Type.String({ minLength: 3, maxLength: 15 })
    })
  }

  fastify.post("/edit-businesname", { schema }, async (request, reply) => {
    try {
      const { business_name } = request.body as { business_name: string }
      await businesmens.findByIdAndUpdate(request.user, { $set: { business_name } })
      return { status: "success", ok: true }
    } catch (error: any) {
      console.error(error); // Log the error for debugging purposes
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error"); // Generic error for unexpected issues
    }
  })
}
export default businesNameEditRouter