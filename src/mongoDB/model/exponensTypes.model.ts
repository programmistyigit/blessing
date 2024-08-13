import { model, Schema } from "mongoose";

const exponensTypes_schema = new Schema({
  keyword: { type: String , required: true , unique: true},
  description:String
})

exponensTypes_schema.pre('find', async function (this: any, next: any) {
  const count = await this.model('exponensTypes').countDocuments();
  if (count === 0) {
    await this.model('exponensTypes').create({ keyword: 'ish xaqi harajatlari', description: 'default description' });
  }
  next();
});
const exponensTypes_model = model("exponensTypes" , exponensTypes_schema)

export default exponensTypes_model