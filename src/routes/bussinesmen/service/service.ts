import { FastifyPluginAsync } from "fastify";
import { depositeRouter } from "./deposite";
import { periotsRouter } from "./periots";
import { createUniqueKey, workerRouter, workerTypeRouter } from "./workers";
import { spaceRouter } from "./spaces";
import { exponensRouter, exponensTypeRouter } from "./exponens";
import { permissionRouter } from "./permission";
import { TaskRouter } from "./tasks";

const serviceRouter: FastifyPluginAsync = async (fastify) => {
  fastify.register(depositeRouter, { prefix: '/deposite' });
  fastify.register(periotsRouter, { prefix: '/periots' });
  fastify.register(workerRouter, { prefix: '/worker' });
  fastify.register(workerTypeRouter, { prefix: '/worker/type' });
  fastify.register(spaceRouter, { prefix: '/space' });
  fastify.register(exponensRouter, { prefix: '/exponens' });
  fastify.register(exponensTypeRouter, { prefix: '/exponens/type' });
  fastify.register(createUniqueKey, { prefix: "/worker" });
  fastify.register(permissionRouter, { prefix: "/permission" })
  fastify.register(TaskRouter, { prefix: "/task" })
};

export default serviceRouter;
