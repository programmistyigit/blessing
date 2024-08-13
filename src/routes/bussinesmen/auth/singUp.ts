import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema, preHandlerAsyncHookHandler } from "fastify";
import { businesmens } from "../../../mongoDB/model";
import bcrypt from "bcrypt";

// Define the expected body structure for the request
type Body = {
  login: string; // Username for login
  password: string; // User's password
};

const bussinesMenSingUpRouter: FastifyPluginAsync = async (fastify) => {
  // Define the schema for validation using Sinclair Typebox
  const schema: FastifySchema = {
    body: Type.Object({
      login: Type.String({ minLength: 5, maxLength: 10 }), // Username length restrictions
      password: Type.String({ pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$" }), // Password complexity requirements
    }),
  };

  // Pre-handler function to perform checks before the main handler
  const preHandler: preHandlerAsyncHookHandler = async (request, reply) => {
    try {
      // Check if a business already exists (assuming only one business is allowed)
      const existingUser = await businesmens.find({});
      if (existingUser.length > 0) {
        return reply.code(409).send({ status: "error", message: "Business already exists" });
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      return reply.code(500).send({ status: "error", message: "Internal server error" });
    }
  };

  // Main handler for business signup
  fastify.post("/singUp", { schema, preHandler }, async (request, reply) => {
    try {
      const { login, password } = request.body as Body;

      // Generate a secure salt and hash the password in a single step
      const saltAndHash = await bcrypt.hash(password, 10); // 10 is a common cost factor for bcrypt

      // Create a new business document with login and hashed password
      await businesmens.create({ login, password: saltAndHash });

      // Send a successful response without sensitive data
      return reply.code(201).send({ status: "success", ok: true }); 
      // Avoid sending the hashed password for security reasons
    } catch (error) {
      console.error(error); // Log the error for debugging
      return reply.code(500).send({ status: "error", message: "Internal server error" });
    }
  });
};

export default bussinesMenSingUpRouter;
