import { periots } from "../mongoDB/model";


export default async function getTotalSoldChicks(periodId:string) {
  try {
    const period = await periots.findById(periodId).populate('number_of_chicks_sold.number');

    if (!period) {
      throw new Error('Period not found');
    }

    const totalSoldChicks = period.number_of_chicks_sold.reduce((acc:number, item:any) => {
      return acc + item.number;
    }, 0);

    return totalSoldChicks;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
