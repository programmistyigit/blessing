import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, FastifySchema, preHandlerAsyncHookHandler } from "fastify";
import { businesmens, periots } from "../../../../mongoDB/model";
import bson_regExp from "../../../../constants/bson_regExp";
import periots_model from "../../../../mongoDB/model/periots.model";

// **Type definitions for request body and update data**
type Body = {
  periot_name?: string;
  responsible_for_the_period?: Array<{ space: string; worker: string }>;
  number_of_initial_chicks?: Array<{ space: string; number: number }>;
  _id: string; // Required for update
};

type UpdateData = {
  periot_name?: string;
  responsible_for_the_period?: Array<{ space: string; worker: string }>;
  number_of_initial_chicks?: Array<{ space: string; number: number }>;
};

type StopPeriots = {
  _id: string
}

const periotsRouter: FastifyPluginAsync = async (fastify) => {
  // **Schema definitions for request validation**
  const createSchema: FastifySchema = {
    body: Type.Object({
      periot_name: Type.Optional(Type.String({ minLength: 4 })),
    }),
  };

  const updateSchema: FastifySchema = {
    body: Type.Object({
      periot_name: Type.Optional(Type.String({ minLength: 5 })),
      responsible_for_the_period: Type.Optional(Type.Array(Type.Object({ space: Type.String({ pattern: `${bson_regExp}` }), worker: Type.String({ pattern: `${bson_regExp}` }) }))),
      number_of_initial_chicks: Type.Optional(Type.Array(Type.Object({ spaces: Type.String({ pattern: `${bson_regExp}` }), number: Type.Number({ minimum: 0 }) }))),
      _id: Type.Required(Type.String({ pattern: `${bson_regExp}` })),
    }),
  };

  const stopPeriots: FastifySchema = {
    querystring: Type.Object({
      _id: Type.String({ pattern: `${bson_regExp}` })
    })
  }
  // **Pre-handler for common checks**
  const preHandler: preHandlerAsyncHookHandler = async (request, reply) => {
    try {
      // Find the businessman by ID
      const user = await businesmens.findById(request.user);

      // Check if businessman exists
      if (!user) {
        throw new Error("Businessman not found");
      }

      // Check for existing current period (applicable to create route only)
      if (user.current_periot) {
        throw new Error("Cannot create a new period when one already exists");
      }
    } catch (error: any) {
      console.error(error);
      return reply.status(401).send({ message: error.message, status: "error", ok: false });
    }
  };

  // **Route handler for creating a new period**
  fastify.post("/create-periots", { schema: createSchema, preHandler }, async (request, reply) => {
    try {
      const { periot_name } = request.body as Body;

      // Create new period object
      const payload = {
        periot_createData: new Date(),
        periot_name,
        status: "is expected", // Set initial status
      };

      // Create and save new period
      const newPeriots = await periots.create(payload);

      // Update businessman with new period ID
      const updatedBusinessman = await businesmens.findByIdAndUpdate(
        request.user,
        {
          $set: { current_periot: newPeriots._id },
          $push: { periots: newPeriots._id },
        },
        { new: true }
      );

      // Check for successful update
      if (!updatedBusinessman) {
        return reply.code(404).send({ message: "Businessman not found" });
      }

      // Send successful response with updated information
      return reply.code(200).send({
        status: "success",
        ok: true,
        result: {
          data: {
            current_periot: updatedBusinessman.current_periot,
            periots: updatedBusinessman.periots,
          },
        },
      });
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ ok: false, status: "error", message: "Internal server error!" });
    }
  });

  // **Route handler for updating a period**
  fastify.post("/update-periots", { schema: updateSchema }, async (request, reply) => {
    try {
      const { periot_name, responsible_for_the_period, number_of_initial_chicks, _id } = request.body as Body;

      const updateData: UpdateData = {};

      if (periot_name !== undefined) {
        updateData.periot_name = periot_name;
      }
      if (responsible_for_the_period !== undefined) {
        updateData.responsible_for_the_period = responsible_for_the_period;
      }
      if (number_of_initial_chicks !== undefined) {
        updateData.number_of_initial_chicks = number_of_initial_chicks;
      }

      if (Object.keys(updateData).length > 0) {
        const updatePeriots = await periots_model.findByIdAndUpdate(_id, { $set: updateData }, { new: true });
        return reply
          .code(200)
          .send({ status: "success", ok: true, result: { data: updatePeriots } });
      } else {
        // Handle case where no properties to update
        throw new Error('No properties to update for period with _id:' + " " + _id);
      }
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ ok: false, status: "error", message: error + "" });
    }
  });

  fastify.get("/stop-periots", { schema: stopPeriots }, async (request, reply) => {
    try {
      // 1. Destructure ID and Validate Request Body
      const { _id } = request.body as StopPeriots; // Type assertion for clarity
      if (!_id) {
        return reply.code(400).send({ status: "error", message: "Missing period ID" });
      }

      // 2. Fetch Period and Check Existence
      const period = await periots.findById(_id).populate([
        'number_of_dead_chicks.number',
        'number_of_chicks_sold.number',
      ]);
      if (!period) {
        return reply.code(400).send({ status: "error", message: "Period not found" });
      }

      // 3. Calculate Total Numbers Efficiently
      const totalDeadChicks = period.number_of_dead_chicks.reduce((acc, item: any) => acc + item.number, 0);
      const totalSoldChicks = period.number_of_chicks_sold.reduce((acc, item: any) => acc + item.number, 0);
      const totalInitialChicks = period.number_of_initial_chicks.reduce((acc, item) => acc + item.number, 0);

      // 4. Validate Dead and Sold Chicks Consistency
      if (totalDeadChicks + totalSoldChicks > totalInitialChicks) {
        return reply.code(400).send({
          status: "warning",
          ok: false,
          message: "Total dead and sold chicks exceed initial chicks",
          result: { totalDeadChicks, totalInitialChicks, totalSoldChicks },
        });
      }

      // 5. Update Period Status and Save
      period.status = "finished";
      await period.save();

      // 6. Return Success Response with Period Data
      return reply.code(200).send({
        status: "success",
        ok: true,
        message: "Period stopped successfully",
        result: {
          data: { totalDeadChicks, totalInitialChicks, totalSoldChicks },
          periodState: period, // Include updated period state
        },
      });
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        status: "error",
        message: "Internal server error",
      });
    }
  });


  fastify.get("/start-periot", async (request, reply) => {
    try {
      const bussinesmen = await businesmens.findById(request.user)
      if (bussinesmen?.current_periot) {
        const periot = await periots.findById(bussinesmen.current_periot._id)
        if(periot?.status == "is expected"){
          const updatePeriod = await periots.findByIdAndUpdate(periot._id , { $set: { status: "continues" } } , { new: true})
          return reply.code(200).send({ status: "success", result: updatePeriod })
        }
        return reply.code(400).send({ status: "warn" , message: "Taqiqlangan urunish! Davr allaqachon ishga tushurilgan yoki toxtatilgan!"})
      }
      return reply.code(424).send({ status: "error" , message: "Davr hali yaratilmagan avvalgi davr toxtatilgan bolishi mumkun!"})
    } catch (error:any) {
      console.error(error)
      return reply.code(500).send({ status: "error" , message: "Internal Server Error"})
    }
  })
};

export default periotsRouter;
