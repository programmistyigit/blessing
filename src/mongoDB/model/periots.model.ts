import { model, Schema } from "mongoose";

const periots_schema = new Schema({
  responsible_for_the_period: [
    {
      space: {
        type: Schema.Types.ObjectId,
        ref: "business_spaces"
      },
      worker: {
        type: Schema.Types.ObjectId,
        ref: "workers"
      }
    }
  ], //javobgar ishchi 
  status: { type: String, enum: ["continues", "finished", "is expected"] },
  periot_name: { type: String, default: "exomple periot" },
  periot_createData: { type: Date, required: true },
  periot_end_date: { type: Date, default: undefined },
  number_of_initial_chicks: [
    {
      spaces: {
        type: Schema.Types.ObjectId,
        ref: "business_spaces"
      },
      number: {
        type: Number,
        default: 0
      }
    }
  ], // boshlangich soni jojani

  number_of_dead_chicks: [
    {
      spaces: {
        type: Schema.Types.ObjectId,
        ref: "business_spaces"
      },
      number: {
        type: Schema.Types.ObjectId,
        ref: "number_of_dead_chicks"
      }
    }
  ], // o'lgan jojalar

  number_of_chicks_sold: [
    {
      spaces: {
        type: Schema.Types.ObjectId,
        ref: "business_spaces"
      },
      number: {
        type: Schema.Types.ObjectId,
        ref: "number_of_chicks_solds"
      }
    }
  ],// sotilgan jojalar

  medical_drug: [{ type: Schema.Types.ObjectId, ref: "medical_drugs" }], // dori darmon
  average_weight: [
    {
      spaces: {
        type: Schema.Types.ObjectId,
        ref: "business_spaces"
      },
      data: {
        type: Schema.Types.ObjectId,
        ref: "average_weights"
      }
    }
  ],// ortacha ogirlik

  chick_feed: [
    {
      spaces: {
        type: Schema.Types.ObjectId,
        ref: "business_spaces"
      },
      data: {
        type: Schema.Types.ObjectId,
        ref: "chick_feeds"
      }
    }
  ],
})

const periots_model = model("periots", periots_schema)

export default periots_model