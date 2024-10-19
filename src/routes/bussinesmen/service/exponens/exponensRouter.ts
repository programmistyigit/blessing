import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import bson_regExp from "../../../../constants/bson_regExp";
import { businesmens, exponens, exponensTypes, periots } from "../../../../mongoDB/model";
import mongoose from "mongoose";

// **Type definitions for request bodies (clear and concise)**
type CreateBody = {
  description?: string; // Optional description (max 100 chars)
  exponens_types: string; // Required exponens type (matching BSON RegExp)
  exponens_value: {
    usd: number; // USD value (default: 0, minimum: 0)
    uzs: number; // UZS value (default: 0, minimum: 0)
  };
  exponens_date: string; // Exponens date (default: current date)
};

type EditBody = Partial<CreateBody>; // Allow partial updates for Edit

const exponensRouter: FastifyPluginAsync = async (fastify) => {

  // **Function to check if exponens type exists (error handling)**
  const checkExponensType = async (_id:any) => {
    const validateID = mongoose.Types.ObjectId.isValid(_id)
    if(!validateID) throw new Error("Invalid Id data")
    const check = await exponensTypes.findById(_id);
    if (!check) throw new Error("Exponens type not found");
  };

  // **Route schemas for validation**
  const schemaCreate: FastifySchema = {
    body: Type.Object({
      description: Type.Optional(Type.String({ maxLength: 100 })),
      exponens_types: Type.String(),
      exponens_value: Type.Object({
        usd: Type.Number({ default: 0, minimum: 0 }),
        uzs: Type.Number({ default: 0, minimum: 0 }),
      }),
      exponens_date: Type.String(),
    }),
  };

  const schemaEdit: FastifySchema = {
    body: Type.Partial(<any>schemaCreate.body),
    querystring: Type.Object({ _id: Type.String({ pattern: `${bson_regExp}` }) }),
  };

  const schemaDelete: FastifySchema = {
    querystring: schemaEdit.querystring,
  };

  // **Create Exponens route handler (clear comments)**
  fastify.post("/create-exponens", { schema: schemaCreate }, async (request, reply) => {
    try {
      // **1. Validate exponens type existence**
      const { exponens_types } = request.body as CreateBody;
      await checkExponensType(exponens_types);

      const businesmen = await businesmens.findById(request.user)
      const currentPeriots = businesmen?.current_periot?._id
      if(!currentPeriots) throw new Error("Davr boshlanmaguncha harajat qoshilmaydi");
      // **2. Create new exponens document**
      const newExponens = await exponens.create(request.body);
    const periot = await periots.findByIdAndUpdate(currentPeriots , { $push: { exponens: newExponens._id}})
    if(!periot) throw new Error("Davr topilmadi nimadur hato")

      return reply
        .code(201) // Created status code
        .send({
          status: "success",
          ok: true,
          result: {
            data: newExponens,
            periot
          },
        });
    } catch (error:any) {
      console.error(error);
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error");
    }
  });

  // **Edit Exponens route handler (clear comments)**
  fastify.put("/edit-exponens", { schema: schemaEdit }, async (request, reply) => {
    try {
      // **1. Validate exponens type existence (if updating type)**
      const { exponens_types } = request.body as EditBody;
      const { _id } = request.query as { _id: string };

      if (exponens_types) await checkExponensType(exponens_types);

      // **2. Update exponens document**
      const updatedExponens = await exponens.findByIdAndUpdate(_id, { $set: request.body as EditBody });
      if (!updatedExponens) throw new Error("Exponens document not found");

      return {
        status: "success",
        ok: true,
        result: {
          data: updatedExponens,
        },
      };
    } catch (error:any) {
      console.error(error);
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error");
    }
  });

  // **Delete Exponens route handler (clear comments)**
  fastify.delete("/delete-exponens", { schema: schemaDelete }, async (request, reply) => {
    try {
      // **1. Delete exponens document**
      const { _id } = request.query as { _id: string };
      const deletedExponens = await exponens.findByIdAndDelete(_id);
      if (!deletedExponens) throw new Error("Exponens document not found");

      return { status: "success", ok: true };
    } catch (error:any) {
      console.error(error);
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error");
    }
  });
};

export default exponensRouter;
