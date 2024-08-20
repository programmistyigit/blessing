import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import bson_regExp from "../../../constants/bson_regExp";
import { drug, medical_drug, periots } from "../../../mongoDB/model";
import _ from "lodash";

const medicalDrugRouter: FastifyPluginAsync = async (fastify) => {

  const validateDrug = async (_id: string, count: number) => {
    const exitingDrug = await drug.findById(_id)
    if (!exitingDrug) throw new Error("drug not found");
    if (exitingDrug.amount < count) throw new Error("invalid ammound");
  }

  const schema: FastifySchema = {
    body: Type.Object({
      drug: Type.String({ pattern: `${bson_regExp}` }),
      ammount: Type.Number(),
      description: Type.Optional(Type.String({ maxLength: 100 })),
      day: Type.Optional(Type.String()),
      periot: Type.String({ pattern: `${bson_regExp}`})
    })
  }

  fastify.post("/drug", { schema }, async (request, reply) => {
    try {
      const { drug, day, ammount , periot} = request.body as any
      await validateDrug(drug, ammount);

      const periotData = await periots.findById(periot)
      if(!periotData) throw new Error("Invalid periot data");

      const workersOfPeriot = periotData.responsible_for_the_period.map(({worker}) => worker?._id.toString())
      if(workersOfPeriot.includes(request.user)) throw new Error("no permission");

      const drugPaylod = {...(request.body as any)}
      if(!day){
        drugPaylod.day = new Date().toDateString()
      }
      const newDrugExponens = await medical_drug.create({ ..._.pick(drugPaylod , ["drug" , "ammound" , "description" , "day"]), autor: request.user })
      const updatePeriots = await periots.findOneAndUpdate(periot , { $push: { medical_drug: newDrugExponens._id}})
    
      return reply.code(200).send({ status: "success" , ok: true , result: { data: updatePeriots }})
    
    }
    catch (error: any) {
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


export default medicalDrugRouter