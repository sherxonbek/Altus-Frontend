import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  type AdminStats,
  type WithdrawalRequest,
  type TradeAudit,
  getAdminStats,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getRecentTrades
} from '../../api/admin.api';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardProps) {
  const { user } = useAuthStore();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [trades, setTrades] = useState<TradeAudit[]>([]);
  
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'trades'>('withdrawals');
  const [isLoading, setIsLoading] = useState(true);

  // Reject Modal State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, withdrawalsData, tradesData] = await Promise.all([
        getAdminStats(),
        getWithdrawals(),
        getRecentTrades()
      ]);
      setStats(statsData);
      setWithdrawals(withdrawalsData);
      setTrades(tradesData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Haqiqatan ham ushbu so\'rovni tasdiqlaysizmi?')) return;
    try {
      await approveWithdrawal(id);
      fetchData(); // refresh
      // toast success (we can add toast if available)
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason) return;
    try {
      await rejectWithdrawal(rejectId, rejectReason);
      setRejectId(null);
      setRejectReason('');
      fetchData(); // refresh
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Ushbu sahifaga faqat platforma ma'murlari kira oladi</h2>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pt-[80px] pb-24 lg:pb-6 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🛡️ Admin Dashboard
        </h1>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Orqaga
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 dark:text-gray-400 mb-2">💳 Jami Platforma Aylanmasi</div>
          <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} so'm</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 dark:text-gray-400 mb-2">📈 Platforma Sof Foydasi</div>
          <div className="text-2xl font-bold text-green-500">{stats.netProfit.toLocaleString()} so'm</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="text-gray-500 dark:text-gray-400 mb-2">👥 Foydalanuvchilar & Kanallar</div>
          <div className="text-2xl font-bold">
            {stats.totalUsers} / {stats.totalChannels}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm relative">
          <div className="text-gray-500 dark:text-gray-400 mb-2">⏳ Kutilayotgan To'lovlar</div>
          <div className="text-2xl font-bold flex items-center gap-2">
            {stats.pendingWithdrawals} 
            {stats.pendingWithdrawals > 0 && (
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex space-x-8">
          <button
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'withdrawals' 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Pul Yechib Olish So'rovlari
          </button>
          <button
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'trades' 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('trades')}
          >
            So'nggi Savdolar Auditi
          </button>
        </div>
      </div>

      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          {withdrawals.length === 0 ? (
            <p className="text-gray-500">Hech qanday so'rov topilmadi.</p>
          ) : (
            withdrawals.map(req => (
              <div key={req.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                    {req.authorAvatar ? (
                      <img src={req.authorAvatar} alt={req.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                        {req.authorName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{req.authorName} ({req.channelName})</h3>
                    <p className="text-sm text-gray-500">{req.authorPhone} • {new Date(req.createdAt).toLocaleString()}</p>
                    <p className="text-sm font-mono mt-1 text-gray-700 dark:text-gray-300">Karta: {req.cardNumber}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-2">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {req.amount.toLocaleString()} so'm
                  </div>
                  <div className="flex items-center gap-2">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition"
                        >
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() => setRejectId(req.id)}
                          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
                        >
                          Rad etish
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        req.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {req.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-500 dark:text-gray-400">
                <th className="p-4 font-medium">Sana</th>
                <th className="p-4 font-medium">Xaridor</th>
                <th className="p-4 font-medium">Kurs/Kanal</th>
                <th className="p-4 font-medium">Narxi</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">Hech qanday savdo topilmadi.</td>
                </tr>
              ) : (
                trades.map(trade => (
                  <tr key={trade.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(trade.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium">{trade.buyerName}</td>
                    <td className="p-4">{trade.courseName}</td>
                    <td className="p-4 font-medium text-green-600 dark:text-green-400">
                      {trade.price.toLocaleString()} so'm
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">So'rovni rad etish</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Iltimos, rad etish sababini kiriting. Ushbu xabar muallifga yuboriladi va pul qaytariladi.
            </p>
            <textarea
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 mb-4 min-h-[100px] outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Sabab..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                disabled={!rejectReason.trim()}
              >
                Rad etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
