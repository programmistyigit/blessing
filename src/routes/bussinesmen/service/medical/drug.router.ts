import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { drug, media } from "../../../../mongoDB/model";
import mongoose from "mongoose";

const drugRouter: FastifyPluginAsync = async (fastify) => {
    const schemaCreate: FastifySchema = {
        body: Type.Object({
            name: Type.String({ minLength: 2 ,maxLength: 15 }),
            amount_type: Type.String(),
            documentation: Type.String({ minLength: 0 , maxLength: 1000 }),
            key: Type.String({ minLength: 2 , maxLength: 10}),
            warningValue: Type.Number({ minimum: 0}),
            image: Type.String()
        })
    }

    const schemaEdit: FastifySchema = {
        body: Type.Object({
            _id: Type.String(),
            image: Type.Optional(Type.String()),
            name: Type.Optional(Type.String()),
            key: Type.Optional(Type.String()),
            documentation: Type.Optional(Type.String()),
            warningValue:Type.Optional(Type.String())
        })
    }

    void fastify.post("/drug" , { schema: schemaCreate } , async (request, reply) => {
        try {
            const {name, image} = request.body as { name: string, image: string}
            const exitingDrugName = await drug.findOne({ name })
            if(exitingDrugName) return reply.badRequest("Dori oldindan mavjud!");
            
            const exiingImage = await media.findById(image)
            if(!exiingImage) return reply.badRequest("Rasm malumotlar bazasida topilmadi!")
            
            const newDrug = await drug.create(request.body)
            return reply.send({ status: "success", result: newDrug })
        } catch (error) {
            console.error(error)
            return reply.internalServerError("Serverda kutilmagan xatolik yuz berdi"+error)
        }

    })

    void fastify.put("/drug" , {schema: schemaEdit} , async (request, reply) => {
        try {
            const {_id} = request.body as { _id: string}
            const isMongoseId = mongoose.Types.ObjectId.isValid(_id)
            if(!isMongoseId) return reply.badRequest("Dori 'Id'sida hatolik aniqlandi!");
            
            const exitingDrug = await drug.findById(_id)
            if(!exitingDrug) return reply.badRequest("Dori 'Id'sida hatolik aniqlandi!");

            const updateDrug = await exitingDrug.updateOne({ $set: (request.body as any)}, { new: true})
            return reply.send({ status: "success", result: updateDrug})

        } catch (error) {
            console.error(error)
            return reply.internalServerError("Serverda kutilmagan xatolik yuz berdi")
        }
    })
}

export default drugRouter