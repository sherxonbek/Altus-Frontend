import { apiClient } from './client';

export interface AdminStats {
  totalRevenue: number;
  netProfit: number;
  totalUsers: number;
  totalChannels: number;
  pendingWithdrawals: number;
}

export interface WithdrawalRequest {
  id: string;
  authorId: string;
  authorName: string;
  authorPhone: string;
  authorAvatar?: string;
  channelId: string;
  channelName: string;
  cardNumber: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface TradeAudit {
  id: string;
  buyerId: string;
  buyerName: string;
  courseName: string;
  price: number;
  createdAt: string;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const { data } = await apiClient.get('/admin/stats');
  return data?.data || data;
};

export const getWithdrawals = async (status?: string): Promise<WithdrawalRequest[]> => {
  const { data } = await apiClient.get('/admin/withdrawals', {
    params: { status }
  });
  return data?.data || data;
};

export const approveWithdrawal = async (id: string): Promise<void> => {
  await apiClient.post(`/admin/withdrawals/${id}/approve`);
};

export const rejectWithdrawal = async (id: string, reason?: string): Promise<void> => {
  await apiClient.post(`/admin/withdrawals/${id}/reject`, { reason });
};

export const getRecentTrades = async (): Promise<TradeAudit[]> => {
  const { data } = await apiClient.get('/admin/trades');
  return data?.data || data;
};

export interface AdminChannelOwner {
  id: string;
  fullName: string;
  phone: string;
  avatar?: string;
  coins: number;
  createdAt: string;
}

export interface AdminChannelPlaylist {
  id: string;
  title: string;
  thumbnail: string;
  rawPrice: number;
  price: string;
  rating: number;
  videosCount: number;
  createdAt: string;
}

export interface AdminChannel {
  id: string;
  title: string;
  username: string;
  avatar?: string;
  banner?: string;
  description?: string;
  subscribersCount: number;
  videosCount: number;
  playlistsCount: number;
  totalViews: number;
  balance: number;
  createdAt: string;
  owner: AdminChannelOwner;
  playlists: AdminChannelPlaylist[];
}

export interface AdminUser {
  id: string;
  fullName: string;
  phone: string;
  role: 'user' | 'admin';
  coins: number;
  createdAt: string;
}

export const getAdminChannels = async (): Promise<AdminChannel[]> => {
  const { data } = await apiClient.get('/admin/channels');
  return data?.data || data;
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const { data } = await apiClient.get('/admin/users');
  return data?.data || data;
};

