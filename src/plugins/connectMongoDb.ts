import fp from 'fastify-plugin';
import mongoose from 'mongoose';
const connectMongoDb = fp(async (fastify) => {
  fastify.decorate("mongoDBconnect" , async (url:string):Promise<void> => {
    const connection = await mongoose.connect(url)
    fastify.log.info(`>_ server connect mongodb to ${connection.connection.host}`)
  })
})

declare module 'fastify' {
  export interface FastifyInstance {
    mongoDBconnect(url:string): Promise<void>;
  }
}

export default connectMongoDb