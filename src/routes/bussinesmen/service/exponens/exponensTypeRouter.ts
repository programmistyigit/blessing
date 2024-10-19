import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { exponens, exponensTypes } from "../../../../mongoDB/model";
import bson_regExp from "../../../../constants/bson_regExp";
import exponensTypes_model from "../../../../mongoDB/model/exponensTypes.model";

// Define type interfaces for request bodies and queries
type CreateBody = {
  keyword: string;
  description?: string; // Optional description field
};

type EditBody = Partial<CreateBody>; // Allows partial updates of CreateBody
type EditQuery = { _id: string }; // Query parameter for edit by ID
type DeleteQuery = EditQuery; // Reuse EditQuery for delete by ID

const exponensTypeRouter: FastifyPluginAsync = async (fastify) => {
  // Helper function to check for unique keyword before creation or update
  const uniqueKeywordCheck = async (keyword: string) => {
    const existing = await exponensTypes.findOne({ keyword });
    if (existing) {
      throw new Error("Keyword name already exists!");
    }
  };

  // Define Fastify schema for create request
  const schemaCreate: FastifySchema = {
    body: Type.Object({
      keyword: Type.String({ minLength: 3, maxLength: 15 }),
      description: Type.Optional(Type.String({ maxLength: 100 })),
    }),
    querystring: Type.Object({}), // No query parameters needed for create
  };

  // Define Fastify schema for edit request
  const schemaEdit: FastifySchema = {
    body: Type.Object({
      keyword: Type.Optional(Type.String({ minLength: 3, maxLength: 15 })),
      description: Type.Optional(Type.String({ maxLength: 100 })),
    }),
    querystring: Type.Object({
      _id: Type.String({ }),
    }),
  };

  // Define Fastify schema for delete request
  const schemaDelete: FastifySchema = {
    body: Type.Object({}), // No body parameters needed for delete
    querystring: Type.Object({
      _id: Type.String({ pattern: `${bson_regExp}` }),
    }),
  };

  // **Create Exponens Type** route handler
  fastify.post("/create-type", { schema: schemaCreate }, async (request, reply) => {
    try {
      const { keyword, description } = request.body as CreateBody;

      // Check for unique keyword
      await uniqueKeywordCheck(keyword);

      // Create new exponensType document
      const newExponensType = await exponensTypes.create({ keyword, description });

      // Send successful response with created data
      return reply.code(201).send({
        status: "success",
        ok: true,
        result: { data: newExponensType },
      });
    } catch (error:any) {
      // Handle errors appropriately with informative messages
      console.error(error); // Log the error for debugging purposes
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error"); // Generic error for unexpected issues
    }
  });

  // **Edit Exponens Type** route handler
  fastify.put("/edit-type", { schema: schemaEdit }, async (request, reply) => {
    try {
      const { keyword } = request.body as EditBody; // Optional keyword update
      const { _id } = request.query as EditQuery;

      // Check for unique keyword if provided
      if (keyword) {
        await uniqueKeywordCheck(keyword);
      }

      // Update exponensType document
      const editedExponensType = await exponensTypes.findByIdAndUpdate(_id, {
        $set: request.body as EditBody, // Update using full request body (partial updates)
      });

      if (!editedExponensType) {
        throw new Error("Invalid ID data (document not found)");
      }

      // Send successful response with updated data
      return reply.code(200).send({
        status: "success",
        ok: true,
        result: { data: editedExponensType },
      });
    } catch (error:any) {
      // Handle errors appropriately with informative messages
      console.error(error); // Log the error for debugging purposes
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error"); // Generic error for unexpected issues
    }
  });

  // **Delete Exponens Type** route handler
  fastify.delete("/delete-type", { schema: schemaDelete }, async (request, reply) => {
    try {
      const { _id } = request.query as DeleteQuery;

      // Check if the exponens type is associated with any active expenses
      const associatedExpenses = await exponens.find({ exponens_types: _id });
      if (associatedExpenses.length > 0) {
        throw new Error("An expense type cannot be deleted, it is associated with active expenses");
      }

      // Delete the exponens type
      const deletedExponensType = await exponensTypes.findByIdAndDelete(_id);
      if (!deletedExponensType) {
        throw new Error("Exponens type not found");
      }

      // Send successful response
      return reply.code(200).send({ status: "success", ok: true });
    } catch (error:any) {
      // Handle errors appropriately with informative messages
      console.error(error); // Log the error for debugging purposes
      if (error.message) {
        return reply.code(400).send({ status: "error", ok: false, message: error.message });
      }
      return reply.internalServerError("Internal server error"); // Generic error for unexpected issues
    }
  });

  fastify.get("/all-type" , async (request, reply) => {
    try {
      const allTypes = await exponensTypes_model.find()
      console.log(allTypes);
      
      return { status: "success" , ok:true , result: allTypes}
    } catch (error:any) {
      return reply.code(500).send({ status: "error" , ok:false , error: error+""})
    }
  })
};

export default exponensTypeRouter;
