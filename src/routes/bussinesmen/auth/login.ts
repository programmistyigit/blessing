import bcrypt from 'bcrypt';
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema } from "fastify";
import { businesmens } from "../../../mongoDB/model";
import _ from "lodash";

type QueryString = {
  login: string;
  password: string;
};

const bussinesMenLoginRouter: FastifyPluginAsync = async (fastify) => {
  const schema: FastifySchema = {
    querystring: Type.Object({
      login: Type.String(),
      password: Type.String(),
    }),
  };

  fastify.get("/login", { schema }, async (request, reply) => {
    try {
      const { login, password } = request.query as QueryString;

      // Find businessman and validate login credentials in a single step (if supported by your MongoDB driver)
      const [checkBussinesmen] = await businesmens.find({
        login,
      }).limit(1);

      if (!checkBussinesmen) {
        return reply.code(401).send({
          status: "error",
          ok: false,
          message: "Invalid username or password",
        });
      }

      // Securely compare password using a constant-time comparison function (if available in your bcrypt library)
      const isPasswordValid = await bcrypt.compare(password, checkBussinesmen.password);
      if (!isPasswordValid) {
        return reply.code(401).send({
          status: "error",
          ok: false,
          message: "Invalid username or password",
        });
      }

      // Generate JWT with appropriate security measures (e.g., signing algorithm, expiration time)
      const token = fastify.jwt.sign(_.pick(checkBussinesmen, ["_id"]), {
        expiresIn: "365d", // Adjust expiration time as needed
        algorithm: 'HS256', // Consider using a stronger algorithm like 'RS256'
      });

      return reply.code(200).send({
        status: "success",
        ok: true,
        result: {
          Bearer: token,
        },
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      return reply.code(500).send({
        status: "error",
        message: "Internal server error", // Avoid exposing details to the client
      });
    }
  });
};

export default bussinesMenLoginRouter;
