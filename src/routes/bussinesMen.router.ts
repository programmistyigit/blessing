import { FastifyPluginAsync } from "fastify";
import { businesmens, business_spaces, exponens } from "../mongoDB/model";
import { bussinesMenSingUpRouter, bussinesMenLogInRouter, serviceRouter, settingsRouter, createBusinesmen } from "./bussinesmen";
import workerTypes_model from "../mongoDB/model/workerTypes/workerTypes.model";

// Main router for business-related endpoints
const bussinesmenRouter: FastifyPluginAsync = async (fastify, opt) => {
  // Register authentication routes under the /auth prefix
  void fastify.register(bussinesMenSingUpRouter, { prefix: "/auth" });
  void fastify.register(bussinesMenLogInRouter, { prefix: "/auth" });
  void fastify.register(createBusinesmen , { prefix: "/auth"})

  // Endpoint to check if there are registered business owners
  void fastify.get("/verified-businesmen-with-token", async (request, reply) => {
    try {
      const spaceAll = await business_spaces.find()
      console.log(spaceAll);

      const { token } = request.query as { token: string }
      if (!token) return reply.badRequest("no token data");
      const cheskToken = fastify.jwt.verify<{ _id: string }>(token)
      const exitingBusinessmen = await businesmens.findById(cheskToken._id).select("-login -password")
      if (!exitingBusinessmen) reply.badRequest("User not found");
      const allWorkerType = await workerTypes_model.find({})
      const allExponens = await exponens.find({})
      await Promise.all(allWorkerType.map(e => e.populate({ path: "members", strictPopulate: true })))

      await exitingBusinessmen?.populate({ path: "business_space", strictPopulate: true })
      await exitingBusinessmen?.populate({ path: "all_workers", strictPopulate: true, populate: { path: "worker_type", strictPopulate: true, select: "-members" } })
      await exitingBusinessmen?.populate({ path: "periots", strictPopulate: true, populate: { path: "exponens", strictPopulate: true } })
      await exitingBusinessmen?.populate({ path: "current_periot", strictPopulate: true, populate: { path: "exponens", strictPopulate: true } })
      await exitingBusinessmen?.populate({ path: "task", strictPopulate: true, populate: { path: "taskBudjet", strictPopulate: true } })
      return { status: "success", ok: true, result: { data: exitingBusinessmen, athersModel: { allWorkerType, allExponens } } }
    } catch (error: any) {
      return reply.internalServerError(error + "")
    }
  });



  // Register authentication middleware and service routes
  fastify.register(async (instance) => {
    // Middleware to extract and verify user information from the authorization header
    instance.addHook('preHandler', async (request, reply) => {
      const authorizationHeader = request.headers['authorization'];
      if (!authorizationHeader) {
        return reply.code(401).send({ status: "error", ok: false, message: "Unauthorized" })
      }

      const token = authorizationHeader.split(' ')[1];
      try {
        const decoded = instance.jwt.verify<{ _id: string }>(token);
        const user = await businesmens.findById(decoded._id);

        if (!user) {
          throw new Error('Invalid token, please re-login')
        }

        request.user = user._id.toString();
      } catch (err: any) {
        console.error(err);
        return reply.status(401).send({ message: err.message });
      }
    });

    // Register service routes under the /service prefix
    instance.register(serviceRouter, { prefix: "/service" });

    // Register settings routes under the /settings prefix
    instance.register(settingsRouter, { prefix: "/Settings" })
  });
};

// Declare a custom interface to extend the FastifyRequest object
declare module "fastify" {
  export interface FastifyRequest {
    user: string; // Add a user property to store the authenticated user ID
  }
}

export default bussinesmenRouter;
