import bcrypt from 'bcrypt';
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { businesmens } from '../../../mongoDB/model';

const passwordEditRouter: FastifyPluginAsync = async (fastify) => {
  const schema: FastifySchema = {
    body: Type.Object({
      password: Type.String({ pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$" })
    })
  }

  fastify.put("/edit-password", { schema }, async (request, reply) => {
    try {
      const { password } = request.body as { password: string }
      const genSalt = await bcrypt.genSalt(10)
      const passwordToCrypt = await bcrypt.hash(password, genSalt)
      await businesmens.findByIdAndUpdate(request.user, { $set: { password: passwordToCrypt } })
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

export default passwordEditRouter