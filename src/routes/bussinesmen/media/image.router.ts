import { FastifyInstance } from "fastify";
import { pipeline } from "node:stream/promises"
import fs from "fs"
import { v4 } from "uuid";
import { media } from "../../../mongoDB/model";

export default async function imageRouter(fastify: FastifyInstance) {
    fastify.post('/image', async function (req, reply) {
        const data = await req.file()
        if(!data) return reply.badRequest("")

        data.filename="./upload/image/" + v4() + ".jpg"
        try {
            await pipeline(data.file, fs.createWriteStream(data.filename))
            const newImage = await media.create({ url: "/"+data.filename.split("./upload/")[1] })
            reply.send({ status: "success" , result: newImage})
        } catch (error) {
            console.error(error)
            return reply.internalServerError(error+"")            
        }
    })
}