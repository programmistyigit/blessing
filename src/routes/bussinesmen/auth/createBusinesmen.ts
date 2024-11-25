import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { businesmens } from "../../../mongoDB/model";
import bcrypt from "bcrypt"
import _ from "lodash";

const createBusinesmen: FastifyPluginAsync = async (fastify) => {
    const schema: FastifySchema = {
        body: Type.Object({
            business_name: Type.Optional(Type.String()),
            login: Type.String({ minLength: 5, maxLength: 10 }),
            password: Type.String({ pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$" })
        })
    }

    fastify.post("/create", { schema }, async (request, reply) => {
        try {
            const { password } = request.body as { password: string }
            const exitingBusinessmen = await businesmens.find()
            if (exitingBusinessmen.length > 0) return reply.badRequest("businesmen alread exiting!");

            const cryptPasswort = await bcrypt.hash(password, 10)
            const newBussinesmen = await businesmens.create({ ..._.pick(request.body, ['business_name', "login"]), password: cryptPasswort })
            return reply.code(200).send({ result: newBussinesmen })
        } catch (error) {
            return reply.internalServerError(error+"")
        }
    })
}

export default createBusinesmen