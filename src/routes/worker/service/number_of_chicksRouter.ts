import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import bson_regExp from "../../../constants/bson_regExp";
import { business_spaces, number_of_chicks_sold, number_of_dead_chicks, periots } from "../../../mongoDB/model";
import mongoose from "mongoose";
import _ from "lodash";

type Query = { periot: string, space: string, number: number, day: string, description: string }
type Body = { periot: string, space: string, count: number, day: string, description: string, weight: number, average_weight: number }

const number_of_chicksRouter: FastifyPluginAsync = async (fastify) => {

  const cheskPeriots = async (_id: string) => {
    const isValid_id = mongoose.Types.ObjectId.isValid(_id)
    if (!isValid_id) throw new Error("Invalid mongoose ID");

    const exitingPeriots = await periots.findById(_id)
    if (!exitingPeriots) throw new Error("periots not found");

    if (exitingPeriots.status !== "continues") throw new Error("It is possible to try only when the period is active")
  }
  const cheskSpace = async (_id: string, periots_id: string, number: number) => {
    const isValid_id = mongoose.Types.ObjectId.isValid(_id)
    if (!isValid_id) throw new Error("Invalid mongoose ID");

    const exitingSpace = await business_spaces.findById(_id)
    if (!exitingSpace) throw new Error("space not found");

    const exitingPeriots = await periots.findById(periots_id);
    if (!exitingPeriots) throw new Error("");

    const exitingSpaceOfPeriots = exitingPeriots?.number_of_initial_chicks.find(e => e.spaces?._id.toString() == _id)
    if (!exitingSpaceOfPeriots) throw new Error("This space is not included in the current period");

    if (exitingSpaceOfPeriots.number < number) throw new Error(`the maximum number: ${exitingSpaceOfPeriots.number}`)
    return { exitingPeriots, exitingSpaceOfPeriots }
  }

  const schema: FastifySchema = {
    querystring: Type.Object({
      number: Type.Number({ minimum: 0 }),
      day: Type.Optional(Type.String({ maxLength: 25 })),
      description: Type.Optional(Type.String({ maxLength: 100 })),
      periot: Type.String({ pattern: `${bson_regExp}` }),
      space: Type.String({ pattern: `${bson_regExp}` })
    })
  }

  const schemaSold: FastifySchema = {
    body: Type.Object({
      description: Type.Optional(Type.String({ maxLength: 100 })),
      count: Type.Number({ minimum: 1 }),
      weight: Type.Number(),
      day: Type.Optional(Type.String()),
      average_weight: Type.Number(),
      keyword: Type.String({ maxLength: 15 }),
      periot: Type.String({ pattern: `${bson_regExp}` }),
      space: Type.String({ pattern: `${bson_regExp}` })
    })
  }

  fastify.get("/dead_chicks", { schema }, async (request, reply) => {
    try {
      const { periot, space, number, day } = request.query as Query
      await cheskPeriots(periot)
      const { exitingPeriots, exitingSpaceOfPeriots } = await cheskSpace(space, periot, number)
      if (!exitingPeriots) throw new Error("invalid data")
      await exitingPeriots.populate({ path: "number_of_dead_chicks.number", strictPopulate: true })

      const allSolNumber = exitingPeriots.number_of_dead_chicks.map((e: any) => (e.number.value as number)).reduce((i, c) => i + c, 0)
      const residual = exitingSpaceOfPeriots.number - allSolNumber
      if (residual < number) throw new Error(`the maximum number: ${residual}`);

      const isValidWorker = exitingPeriots.responsible_for_the_period.find(({ worker }) => worker?.toString() == request.user)
      if (!isValidWorker) throw new Error("turn on the permission");
      if (isValidWorker.space?.toString() !== space) throw new Error("turn on the permission")

      const paylod = { ...(request.query as Query), author: request.user, value: number }
      if (!day) {
        const currentDay = new Date().toDateString()
        paylod.day = currentDay
      }
      const newNumberOFDeadChisk = await number_of_dead_chicks.create(_.pick(paylod, ["day", "description", "authror", "value", "periot"]))

      const updatePeriotsPaylod = {
        spaces: space,
        number: newNumberOFDeadChisk._id
      }
      const updatePeriots = await periots.findByIdAndUpdate(periot, { $push: { number_of_dead_chicks: updatePeriotsPaylod } }, { new: true })

      return reply
        .code(200)
        .send(
          {
            status: "success",
            ok: true,
            result: {
              data: updatePeriots
            }
          }
        )
    } catch (error: any) {
      console.error(error);
      if (error.message) {
        return reply
          .code(400)
          .send(
            {
              status: "error",
              ok: false,
              message: error.message
            }
          )
      }

      return reply.internalServerError("Internal server error")
    }
  })


  fastify.post("/chicks_sold", { schema: schemaSold }, async (request, reply) => {
    try {
      const { periot, space, count, day } = request.body as Body

      await cheskPeriots(periot)
      const { exitingPeriots, exitingSpaceOfPeriots } = await cheskSpace(space, periot, count)
      await exitingPeriots.populate({ path: "number_of_chicks_sold.number", strictPopulate: true })

      const allSolNumber = exitingPeriots.number_of_chicks_sold.map((e: any) => (e.number.count as number)).reduce((i, c) => i + c, 0)
      const residual = exitingSpaceOfPeriots.number - allSolNumber
      if (residual < count) throw new Error(`the maximum number: ${residual}`);

      const cheskWorker = exitingPeriots.responsible_for_the_period.find(e => e.worker?.toString() == request.user);
      if (!cheskWorker) throw new Error("turn on the permission");

      if (cheskWorker.space?.toString() !== space) throw new Error("turn on the permission");

      const payload = { ...(request.body as Body) }
      if (!day) {
        payload.day = new Date().toDateString()
      }

      const newNumberOfSoldChisk = await number_of_chicks_sold.create({ ..._.pick(payload, ["periot", "description", "count", "weight", "day", "awerage_weight", "keyword"]), autor: request.user })

      const payloadOFUpdatePeriots = {
        spaces: space,
        number: newNumberOfSoldChisk._id
      }

      const updatePeriots = await periots.findByIdAndUpdate(periot, { $push: { number_of_chicks_sold: payloadOFUpdatePeriots } }, { new: true })

      return reply
        .code(200)
        .send(
          {
            status: "success",
            ok: true,
            result: {
              data: updatePeriots
            }
          }
        )
    } catch (error: any) {
      console.error(error);
      if (error.message) {
        return reply
          .code(400)
          .send(
            {
              status: "error",
              ok: false,
              message: error.message
            }
          )
      }

      return reply.internalServerError("Internal server error")
    }
  })
}

export default number_of_chicksRouter