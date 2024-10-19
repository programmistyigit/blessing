import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { router } from "./routes"
export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {

  fastify.withTypeProvider<TypeBoxTypeProvider>()
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(require('@fastify/cors'), {
    origin: '*' // Allow requests from this origin
  });
  
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  fastify.register(router, { prefix: "/api" })
  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.ready().then(() => {
    fastify.mongoDBconnect(process.env.MONGODB_URL as string)
    const routers = fastify.printRoutes()
    fastify.log.info(routers)
  })

};

export default app;
export { app, options }
