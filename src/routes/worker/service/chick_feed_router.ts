import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import bson_regExp from "../../../constants/bson_regExp";
import { businesmens, chick_feeds, periots } from "../../../mongoDB/model";

const chick_feed_router:FastifyPluginAsync = async (fastify) => {
  const schema:FastifySchema = {
    body: Type.Object({
      space: Type.String({ pattern: `${bson_regExp}`}),
      value: Type.Number(),
      day: Type.String(),
      description: Type.Optional(Type.String({ maxLength: 100})),
    })
  }

  fastify.post("/add" , { schema }, async (request, reply) => {
    try {
      const {space , value , day , description} = request.body as any
      const businesmen = await businesmens.find({})
      if(!businesmen[0].current_periot) throw new Error("hi")
      const periots_id = businesmen[0].current_periot._id

      const currentPeriots = await periots.findById(periots_id)
      const allSpaceOfWorker = currentPeriots?.responsible_for_the_period.filter((sp) => sp.space?._id.toString() == space && sp.worker?._id.toString() == request.user)
      if(allSpaceOfWorker?.length == 0) throw new Error("no permission");

      const payload = { author: request.user , value , day , description}
      const newFeeds = await chick_feeds.create(payload)

      const updatePeriotsForFeedsPayload = {
        spaces: space,
        data: newFeeds._id
      }

      currentPeriots?.updateOne({ $push: { chick_feed: updatePeriotsForFeedsPayload}}, { new: true})

      return { status: "success" , ok: true , result: { data:currentPeriots } }
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

export default chick_feed_router