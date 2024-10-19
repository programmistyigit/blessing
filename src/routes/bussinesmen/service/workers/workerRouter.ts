import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import bson_regExp from "../../../../constants/bson_regExp"; // Assuming pre-defined BSON regular expression
import { worker, worker_types, businesmens } from "../../../../mongoDB/model"; // Models for worker, permission, and worker_type
import { permission_list } from "../../../../constants";
import {v4} from "uuid"

// Type definition for worker creation request body
type CreateWorkerBody = {
  fullname: string;
  worker_type: string[]; // Array of worker type IDs (strings)
  permissions?: string[];  // Optional array of permission IDs (strings)
};

// Fastify plugin for worker management routes
const workerRouter: FastifyPluginAsync = async (fastify) => {
  // --- Create Worker Route ---

  // Schema for worker creation request
  const createWorkerSchema: FastifySchema = {
    body: Type.Object({
      fullName: Type.String({ minLength: 5, maxLength: 30 }),
      worker_type: Type.Array(Type.String()),
    })
  };

  // Route handler for creating a worker
  fastify.post("/create-worker", { schema: createWorkerSchema }, async (request, reply) => {
    try {
      const { permissions, worker_type } = request.body as CreateWorkerBody; // Destructure request body

      // Validate worker type IDs exist
      const validWorkerTypes = await worker_types.find({ _id: { $in: worker_type } });
      if (validWorkerTypes.length !== worker_type.length) {
        throw new Error("Invalid worker types ID");
      }

      // Validate permission IDs (if provided)
      if (permissions) {
        const validPermissions = permission_list.filter(e => permissions.includes(e.permission));
        if (validPermissions.length !== permissions.length) {
          throw new Error("Invalid permissions ID");
        }
      }
      const login = v4()

      // Create new worker with validated data
      const newWorker = await worker.create({...(request.body as CreateWorkerBody), login});
        await newWorker.populate({ path: "worker_type" , strictPopulate: true})
      await businesmens.findByIdAndUpdate(request.user , { $push: { all_workers: newWorker._id }})
      await Promise.all(validWorkerTypes.map(ty => ty.updateOne({ $push: { members: newWorker._id }})))

      return { status: "success", ok: true, result: { data: newWorker } }; // Return successful response with created worker data
    } catch (error:any) {
      console.error(error);
      return reply.code(500).send({ status: "error", ok: false, message: error }); // Return error response with clear message
    }
  });

  // --- Remove Worker Route ---

  // Schema for removing worker (by ID)
  const removeWorkerSchema: FastifySchema = {
    querystring: Type.Object({
      _id: Type.String({ pattern: `${bson_regExp}` })
    })
  };

  // Route handler for removing a worker (soft deletion)
  fastify.put("/remove-worker", { schema: removeWorkerSchema }, async (request, reply) => {
    try {
      const { _id } = request.query as { _id: string }; // Destructure query string

      // Find worker by ID
      const workerToRemove = await worker.findById(_id);
      if (!workerToRemove) {
        throw new Error("Worker not found");
      }

      // Soft delete by setting status to "inactive" (or similar)
      workerToRemove.status = "not working"; // Customize status based on your model
      await workerToRemove.save();

      return { status: "success", ok: true }; // Return successful response
    } catch (error:any) {
      console.error(error);
      return reply.code(500).send({ status: "error", ok: false, message: error.message }); // Return error response with clear message
    }
  });
};

export default workerRouter;