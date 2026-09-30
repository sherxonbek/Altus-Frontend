import { apiClient } from './client';

export interface BillingStatsResponse {
  balance: number;
  totalIncome: number;
  monthIncome: number;
  totalSold: number;
  courses: Array<{
    id: string;
    title: string;
    thumbnail: string;
    salesCount: number;
    totalRevenue: number;
  }>;
  recentSubscribers: Array<{
    userId: string;
    fullName: string;
    avatar?: string;
    subscribedAt: string;
  }>;
  recentLikes: any[];
}

export const billingApi = {
  getBillingStats: async (channelId: string = 'my-channel'): Promise<BillingStatsResponse> => {
    const res = await apiClient.get<{ success: boolean; data: BillingStatsResponse }>(`/channels/${channelId}/billing`);
    return res.data.data;
  },

  withdrawMoney: async (data: { amount: number; cardNumber: string }): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.post<{ success: boolean; message?: string }>('/channels/billing/withdraw', data);
    return res.data;
  }
};
