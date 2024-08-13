import { periots } from "../mongoDB/model";

export default async function getTotalDeadChicks(periodId:string):Promise<number> {
  try {
    const period = await periots.findById(periodId).populate('number_of_dead_chicks.number');

    if (!period) {
      throw new Error('Period not found');
    }

    const totalDeadChicks = period.number_of_dead_chicks.reduce((acc:number, item:any) => {
      return acc + item.number;
    }, 0);

    return totalDeadChicks;
  } catch (error) {
    throw error;
  }
}

