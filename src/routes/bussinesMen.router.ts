import { FastifyPluginAsync } from "fastify";
import { businesmens } from "../mongoDB/model";
import { bussinesMenSingUpRouter, bussinesMenLogInRouter, serviceRouter, settingsRouter } from "./bussinesmen";

// Main router for business-related endpoints
const bussinesmenRouter: FastifyPluginAsync = async (fastify , opt) => {
  // Register authentication routes under the /auth prefix
  void fastify.register(bussinesMenSingUpRouter, { prefix: "/auth" });
  void fastify.register(bussinesMenLogInRouter, { prefix: "/auth" });

  // Endpoint to check if there are registered business owners
  void fastify.get("/businessOwnerVerification", async (_, reply) => {
    const hasBusinessOwners = (await businesmens.countDocuments()) > 0;
    return reply.send({ hasBusinessOwners });
  });

  // Register authentication middleware and service routes
  fastify.register(async (instance) => {
    // Middleware to extract and verify user information from the authorization header
    instance.addHook('preHandler', async (request, reply) => {
      const authorizationHeader = request.headers['authorization'];
      if (!authorizationHeader) {
        throw new Error('Unauthorized');
      }

      const token = authorizationHeader.split(' ')[1];
      try {
        const decoded = instance.jwt.verify<{ _id: string }>(token);
        const user = await businesmens.findById(decoded._id);

        if (!user) {
          throw new Error('Invalid token, please re-login')
        }

        request.user = user._id.toString();
      } catch (err:any) {
        console.error(err);
        return reply.status(401).send({ message: err.message });
      }
    });

    // Register service routes under the /service prefix
    instance.register(serviceRouter, { prefix: "/service" });

    // Register settings routes under the /settings prefix
    instance.register(settingsRouter , { prefix: "/Settings"})
  });
};

// Declare a custom interface to extend the FastifyRequest object
declare module "fastify" {
  export interface FastifyRequest {
    user: string; // Add a user property to store the authenticated user ID
  }
}

export default bussinesmenRouter;
