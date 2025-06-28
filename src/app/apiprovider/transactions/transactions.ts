import  api , {baseAPI} from '../apiProvider'


export async function getTransactions(pageNo: number) {
  try {
    const response = await baseAPI.post('/transactions', {
      pageNo
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error('Failed to fetch transactions');
    }

    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}


