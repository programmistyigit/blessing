import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { permission, worker_types } from "../../../../mongoDB/model";

// Type definitions for request bodies and query strings
type CreateWorkerTypeBody = {
  career: string;
  salary: number;
  salary_type: "USD" | "UZS";
  permissions: string[]; // Array of string IDs
};

type EditWorkerTypeBody = Partial<CreateWorkerTypeBody>; // Optional properties for edit

type EditWorkerTypeQuery = {
  _id: string;
};

type DeleteWorkerTypeQuery = EditWorkerTypeQuery;

// Fastify plugin for worker type routes
const workerTypeRouter: FastifyPluginAsync = async (fastify) => {
  // Shared validation function for career name uniqueness
  const validateUniqueCareer = async (career: string) => {
    const existingType = await worker_types.findOne({ career });
    if (existingType) {
      throw new Error("Career name already exists");
    }
  };

  // Route schemas for validation
  const schemaCreate: FastifySchema = {
    body: Type.Object({
      career: Type.String({ minLength: 4, maxLength: 20 }),
      salary: Type.Number({ minimum: 0 }),
      salary_type: Type.String({ pattern: `/USD|UZS/` }),
      permissions: Type.Array(Type.String()), // No pattern needed, validation handled elsewhere
    }),
  };

  const schemaEdit: FastifySchema = {
    body: Type.Object({
      career: Type.Optional(Type.String({ minLength: 4, maxLength: 20 })),
      salary: Type.Optional(Type.Number({ minimum: 0 })),
      salary_type: Type.Optional(Type.String({ pattern: `/USD|UZS/` })),
      permissions: Type.Optional(Type.Array(Type.String())), // No pattern needed, validation handled elsewhere
    }), // Reuse schema for edit with partial properties
    querystring: Type.Object({
      _id: Type.String(),
    }),
  };

  const schemaDelete: FastifySchema = {
    querystring: Type.Object({
      _id: Type.String(),
    }),
  };

  // Create worker type route
  fastify.post("/create-type", { schema: schemaCreate }, async (request, reply) => {
    try {
      const { career, permissions } = request.body as CreateWorkerTypeBody;

      // Validate permission IDs exist
      const existingPermissions = await permission.find({ _id: { $in: permissions } });
      if (existingPermissions.length !== permissions.length) {
        throw new Error("Invalid permission data");
      }

      await validateUniqueCareer(career);

      const newWorkerType = await worker_types.create(request.body);

      return reply.code(200).send({
        status: "success",
        ok: true,
        result: { data: newWorkerType },
      });
    } catch (error: any) {
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error");
    }
  });

  // Edit worker type route
  fastify.put("/edit-type", { schema: schemaEdit }, async (request, reply) => {
    try {
      const { _id, career } = request.query as EditWorkerTypeQuery & Partial<CreateWorkerTypeBody>;

      const existingType = await worker_types.findById(_id);
      if (!existingType) {
        throw new Error("Invalid worker type data");
      }

      if (career && career !== existingType.career) {
        await validateUniqueCareer(career);
      }

      await existingType.updateOne({ $set: (request.body as EditWorkerTypeBody) }); // Efficient update

      return reply.code(200).send({
        status: "success",
        ok: true,
        result: { data: existingType },
      });
    } catch (error: any) {
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error");
    }
  });

  // Delete worker type route
  fastify.delete("/delete-type", { schema: schemaDelete }, async (request, reply) => {
    try {
      const { _id } = request.query as DeleteWorkerTypeQuery;

      const existingType = await worker_types.findById(_id);
      if (!existingType) {
        throw new Error("Invalid worker type ID");
      }
      if (existingType.members.length !== 0) {
        throw new Error("Worker type not empty");
      }

      await existingType.deleteOne();

      return reply.code(200).send({ status: "success", ok: true });
    } catch (error: any) {
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error");
    }
  });
};

export default workerTypeRouter;
