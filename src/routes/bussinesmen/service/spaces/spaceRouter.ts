import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { businesmens, business_spaces } from "../../../../mongoDB/model";
import bson_regExp from "../../../../constants/bson_regExp";

// Type definitions for request bodies and query strings
type CreateSpaceBody = {
  description?: string; // Optional description, max length 200
  name: string; // Required name, max length 20
};

type EditSpaceBody = Partial<CreateSpaceBody> & { // Edit allows partial updates and adds status
  status?: "jarayonda" | "kutilmoqda" | "tozalanmoqda"; // Optional status with specific values
};

type EditSpaceQuery = {
  _id: string;
};

type DeleteSpaceQuery = EditSpaceQuery;

const spaceRouter: FastifyPluginAsync = async (fastify) => {
  // Shared function to validate unique name
  const validateUniqueName = async (name: string) => {
    const existingSpace = await business_spaces.findOne({ name });
    if (existingSpace) {
      throw new Error("Name already exists");
    }
  };

  // Route schemas for validation
  const schemaCreate: FastifySchema = {
    body: Type.Object({
      description: Type.Optional(Type.String({ maxLength: 200 })),
      name: Type.Required(Type.String({ maxLength: 20 })),
    }),
  };

  const schemaEdit: FastifySchema = {
    body: Type.Object({
      description: Type.Optional(Type.String({ maxLength: 200 })),
      name: Type.Optional(Type.String({ maxLength: 20 })),
      status: Type.Optional(Type.String({ pattern: `/jarayonda|kutilmoqda|tozalanmoqda/` })),
    }),
    querystring: Type.Object({
      _id: Type.String({ pattern: `${bson_regExp}` }),
    }),
  };

  const schemaDelete: FastifySchema = {
    querystring: Type.Object({
      _id: Type.String({ pattern: `${bson_regExp}` }),
    }),
  };

  // Create space route
  fastify.post("/create", { schema: schemaCreate }, async (request, reply) => {
    try {
      const { name } = request.body as CreateSpaceBody;

      await validateUniqueName(name); // Validate name uniqueness

      const newSpace = await business_spaces.create(request.body);

      return reply.code(201).send({ // Created (201) status code
        status: "success",
        ok: true,
        result: { data: newSpace },
      });
    } catch (error: any) {
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error");
    }
  });

  // Edit space route
  fastify.put("/edit", { schema: schemaEdit }, async (request, reply) => {
    try {
      const { name } = request.body as EditSpaceBody; // Access name from body
      const { _id } = request.query as EditSpaceQuery; // Access ID from query

      if (name) await validateUniqueName(name); // Validate name if provided

      const existingSpace = await business_spaces.findById(_id);
      if (!existingSpace) {
        throw new Error("Invalid Space ID data");
      }

      // Efficient update using `updateOne` with `$set` operator
      await existingSpace.updateOne({ $set: <EditSpaceBody>request.body });

      return reply.code(200).send({
        status: "success",
        ok: true,
        result: { data: existingSpace },
      });
    } catch (error: any) {
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error");
    }
  });

  // Delete space route
  fastify.delete("/delete", { schema: schemaDelete }, async (request, reply) => {
    try {
      const { _id } = request.query as DeleteSpaceQuery;

      const existingSpace = await business_spaces.findById(_id);
      if (!existingSpace) {
        throw new Error("Invalid Space ID");
      }

      // Check if the space is associated with any businessmen periods
     const businesmen = await businesmens.findById(request.user)
      if (!businesmen?.periots) {
        throw new Error("Space cannot be deleted, it is associated with active periods");
      }

      await existingSpace.deleteOne();

      return reply.code(200).send({ status: "success", ok: true });
    } catch (error: any) {
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error");
    }
  });
};

export default spaceRouter;
