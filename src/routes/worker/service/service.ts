import { FastifyPluginAsync } from "fastify";
import number_of_chicksRouter from "./number_of_chicksRouter";
import medicalDrugRouter from "./medicalDrugRouter";
import average_weight_router from "./average_weight_Router";
import chick_feed_router from "./chick_feed_router";

const workerServiceRouter: FastifyPluginAsync = async (fastify) => {
  fastify.register(number_of_chicksRouter, { prefix: "/number-of-chicks" })
  fastify.register(medicalDrugRouter, { prefix: "/medical" })
  fastify.register(average_weight_router, { prefix: "/average" })
  fastify.register(chick_feed_router, { prefix: "/chick-feed" })
}

export default workerServiceRouter