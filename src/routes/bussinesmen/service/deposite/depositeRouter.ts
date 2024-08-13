import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { businesmens } from "../../../../mongoDB/model";

// Define the expected body structure for the request
type Body = {
  sum: number; // Amount of money to deposit
  usd: number; // Amount of USD to deposit
};

// Define the expected query parameter structure
type Query = {
  type: "set" | "inc"; // Specifies the type of update ("set" or "increment")
};

const depositeRouter: FastifyPluginAsync = async (fastify) => {
  // Define the schema for validation using Sinclair Typebox
  // Includes both body and query parameter validation
  const schema: FastifySchema = {
    body: Type.Object({
      sum: Type.Required(Type.Number({ minimum: 0 })),
      usd: Type.Required(Type.Number({ minimum: 0 })),
    }),
    querystring: Type.Object({
      type: Type.Required(Type.String()), // Ensures a string value for the type parameter
    }),
  };

  // Route handler for updating deposits
  fastify.post("/update-deposit", { schema }, async (request, reply) => {
    try {
      // Extract user ID from the request (assuming it's available through middleware)
      const { user } = request;

      // Extract deposit amounts from the request body
      const { sum, usd } = request.body as Body;

      // Extract the update type from the query parameter
      const { type: updateType } = request.query as Query;

      // Determine the update data based on the update type
      let updateData;
      if (updateType === "set") {
        // Update the entire "deposite" subdocument
        updateData = { $set: { deposite: { deposite_Usd: usd, deposite_Sum: sum } } };
      } else if (updateType === "inc") {
        // Increment specific fields within the "deposite" subdocument
        updateData = { $inc: { 'deposite.deposite_sum': sum, 'deposite.deposite_usd': usd } };
      } else {
        // Return an error for invalid update type
        return reply.code(400).send({ message: "Invalid update type (set or inc expected)" });
      }

      // Update the businessman document with the new deposit values
      const updatedBusinessman = await businesmens.findOneAndUpdate(
        { _id: user }, // Find by user ID
        updateData, // Update data based on type
        { new: true, projection: { deposite: 1 } } // Return the updated document with only the "deposite" field
      );

      // Check if the update was successful
      if (!updatedBusinessman) {
        return reply.code(404).send({ message: "Businessman not found" });
      }

      // Send a successful response with the updated deposit information
      return reply.code(200).send({
        status: "success",
        ok: true,
        result: {
          deposite: updatedBusinessman.deposite, // Include only the updated "deposite" field
        },
      });
    } catch (error) {
      // Handle errors during the update process
      console.error(error);
      return reply.code(500).send({ message: "Internal server error" });
    }
  });
};

export default depositeRouter;
