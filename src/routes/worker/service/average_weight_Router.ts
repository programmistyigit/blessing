import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import bson_regExp from "../../../constants/bson_regExp";
import { average_weight, business_spaces, periots } from "../../../mongoDB/model";

const average_weight_router: FastifyPluginAsync = async (fastify) => {

  const validateSpace = async (s_id: string, p_id: string, day: string, worker_id: string) => {
    const exitingSpace = await business_spaces.findById(s_id);
    if (!exitingSpace) throw new Error("Space not found");

    const exitingPeriots = await periots.findById(p_id);
    if (!exitingPeriots) throw new Error("periot not found");

    const allSpaceOfPeriots = exitingPeriots.number_of_initial_chicks.map(({ spaces }) => spaces?.toString())
    if (!allSpaceOfPeriots.includes(s_id)) throw new Error("space is not included in the current periots");

    await exitingPeriots.populate({ path: "average_weight.data", strictPopulate: true })
    const allAwerageWieght = exitingPeriots.average_weight.filter(({ spaces }) => spaces?._id.toString() == s_id).map((e: any) => e.data.day)
    if (allAwerageWieght.includes(day)) throw new Error("day alread exiting");

    const spaceWorker = exitingPeriots.responsible_for_the_period.filter(({ space, worker }) => space?._id.toString() == s_id && worker?._id.toString() == worker_id)
    if (spaceWorker.length! > 0) throw new Error("no permission")
  }
  const schema: FastifySchema = {
    body: Type.Object({
      space: Type.String({ pattern: `${bson_regExp}` }),
      periot: Type.String({ pattern: `${bson_regExp}` }),
      number_of_chicks: Type.Number({ minimum: 10 }),
      total_weight: Type.Number(),
      day: Type.String()
    })
  }

  fastify.post("/weight", { schema }, async (request, reply) => {
    try {
      const { space, periot, number_of_chicks, total_weight, day } = request.body as any
      await validateSpace(space, periot, day, request.user)
      const value = total_weight / number_of_chicks
      const payload = { value, number_of_chicks, total_weight, day, author: request.user }
      const newAwerageWieght = await average_weight.create(payload)
      const updatePeriot = await periots.findByIdAndUpdate(space, { $push: { average_weight: newAwerageWieght._id } })
      return { status: "success", ok: true, result: { data: updatePeriot } }
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

export default average_weight_router