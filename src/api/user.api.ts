import { apiClient } from './client'

export const topUpCoinsApi = async (
  amount: number
): Promise<{ success: boolean; coins: number; message: string }> => {
  const response = await apiClient.post<{ success: boolean; coins: number; message: string }>(
    '/users/coins/top-up',
    { amount }
  )
  return response.data
}
