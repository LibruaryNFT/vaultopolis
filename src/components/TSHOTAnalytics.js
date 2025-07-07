import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';

// --- Layout wrappers copied from your other components for consistency ---
const MobileAccordion = ({ icon: Icon, title, children }) => (
  <details className="md:hidden group border border-brand-border rounded w-full">
    <summary className="cursor-pointer select-none flex items-center justify-between bg-brand-primary px-2 py-1 font-semibold text-base text-brand-text rounded w-full">
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-2" /> {title}
      </div>
      <span className="transition-transform group-open:rotate-180">▼</span>
    </summary>
    <div className="mt-1 px-2 pb-1">{children}</div>
  </details>
);

const DesktopSection = ({ icon: Icon, title, children }) => (
  <div className="hidden md:block">
    <div className="max-w-6xl mx-auto grid md:grid-cols-[160px_1fr] gap-2">
      <div className="text-right pt-2">
        <span className="inline-flex items-center bg-brand-primary text-brand-text px-2 py-1 rounded">
          <Icon className="w-5 h-5 mr-2" /> {title}
        </span>
      </div>
      {children}
    </div>
  </div>
);


const TSHOTAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        setError('');

        const [leaderboardRes, dailyStatsRes] = await Promise.all([
          fetch("https://api.vaultopolis.com/wallet-leaderboard?limit=3000"),
          fetch("https://api.vaultopolis.com/tshot-stats")
        ]);

        if (!leaderboardRes.ok) throw new Error(`Leaderboard API Error: ${leaderboardRes.statusText}`);
        if (!dailyStatsRes.ok) throw new Error(`Daily Stats API Error: ${dailyStatsRes.statusText}`);
        
        const leaderboardData = await leaderboardRes.json();
        const dailyStatsData = await dailyStatsRes.json();
        
        const items = leaderboardData.items || [];

        // --- Lifetime Stats Processing ---
        const totalDeposits = items.reduce((sum, user) => sum + (user.NFTToTSHOTSwapCompleted || 0), 0);
        const totalWithdrawals = items.reduce((sum, user) => sum + (user.TSHOTToNFTSwapCompleted || 0), 0);
        const totalMomentsExchanged = totalDeposits + totalWithdrawals; // NEW: Total activity
        const totalUniqueWallets = items.length; // This is correct as the API returns one doc per wallet.
        
        const top10Depositors = [...items].sort((a, b) => (b.NFTToTSHOTSwapCompleted || 0) - (a.NFTToTSHOTSwapCompleted || 0)).slice(0, 10);
        const top10Withdrawers = [...items].sort((a, b) => (b.TSHOTToNFTSwapCompleted || 0) - (a.TSHOTToNFTSwapCompleted || 0)).slice(0, 10);
        const top10Net = [...items].sort((a, b) => (b.net || 0) - (a.net || 0)).slice(0, 10);

        const userTiers = { "1-10": 0, "11-50": 0, "51-100": 0, "101-500": 0, "501+": 0 };
        items.forEach(user => {
          const net = user.net || 0;
          if (net >= 1 && net <= 10) userTiers["1-10"]++;
          else if (net >= 11 && net <= 50) userTiers["11-50"]++;
          else if (net >= 51 && net <= 100) userTiers["51-100"]++;
          else if (net >= 101 && net <= 500) userTiers["101-500"]++;
          else if (net > 500) userTiers["501+"]++;
        });
        const barChartData = Object.keys(userTiers).map(key => ({ name: key, Users: userTiers[key] }));
        
        const top10DepositsSum = top10Depositors.reduce((sum, user) => sum + (user.NFTToTSHOTSwapCompleted || 0), 0);
        const pieChartData = [
            { name: 'Top 10 Depositors', value: top10DepositsSum },
            { name: 'All Other Users', value: totalDeposits - top10DepositsSum }
        ];

        setStats({
          totalDeposits, totalWithdrawals, totalUniqueWallets, totalMomentsExchanged,
          top10Depositors, top10Withdrawers, top10Net,
          barChartData, pieChartData
        });
        
        setDailyData(dailyStatsData.items || []);

      } catch (err) {
        setError(err.message || 'Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  const PIE_COLORS = ['#8884d8', '#82ca9d'];

  const renderTopList = (list, title, dataKey) => (
    <div className="bg-brand-secondary p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <ol className="list-decimal list-inside space-y-2">
            {list.map((item, index) => (
                <li key={item._id} className="text-sm flex justify-between">
                    <span className="truncate" title={item._id}>{index + 1}. {item._id.substring(0, 6)}...{item._id.substring(item._id.length - 4)}</span>
                    <span className="font-bold">{(item[dataKey] || 0).toLocaleString()}</span>
                </li>
            ))}
        </ol>
    </div>
  );

  const AnalyticsBlock = () => {
    if (loading) return <div className="text-center p-8 bg-brand-primary rounded-lg">Loading TSHOT Analytics...</div>;
    if (error) return <div className="text-center p-8 text-red-400 bg-brand-primary rounded-lg">Error: {error}</div>;

    return (
        <div className="bg-brand-primary text-brand-text p-4 rounded-lg space-y-6">
            <div>
                <p className="text-xs text-brand-text/60 text-center mb-4">* All data reflects lifetime activity from May 1st, 2025 onwards.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-brand-secondary p-4 rounded-lg"><div className="text-2xl md:text-3xl font-bold">{(stats.totalMomentsExchanged || 0).toLocaleString()}</div><div className="text-xs md:text-sm text-brand-text/70">Total Moments Exchanged</div></div>
                <div className="bg-brand-secondary p-4 rounded-lg"><div className="text-2xl md:text-3xl font-bold">{(stats.totalDeposits || 0).toLocaleString()}</div><div className="text-xs md:text-sm text-brand-text/70">Total Deposits</div></div>
                <div className="bg-brand-secondary p-4 rounded-lg"><div className="text-2xl md:text-3xl font-bold">{(stats.totalWithdrawals || 0).toLocaleString()}</div><div className="text-xs md:text-sm text-brand-text/70">Total Withdrawals</div></div>
                <div className="bg-brand-secondary p-4 rounded-lg"><div className="text-2xl md:text-3xl font-bold">{(stats.totalUniqueWallets || 0).toLocaleString()}</div><div className="text-xs md:text-sm text-brand-text/70">Unique Wallets</div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderTopList(stats.top10Depositors, "Top 10 Depositors", "NFTToTSHOTSwapCompleted")}
                {renderTopList(stats.top10Withdrawers, "Top 10 Withdrawers", "TSHOTToNFTSwapCompleted")}
                {renderTopList(stats.top10Net, "Top 10 Net Deposits", "net")}
            </div>

            {/* Daily Activity Line Chart */}
            <div>
                <h3 className="text-lg font-semibold mb-2 text-center">Daily Protocol Activity</h3>
                <div className="bg-brand-secondary p-4 rounded-lg h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip contentStyle={{ backgroundColor: '#2d3748' }}/>
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="dailyIncoming" name="Deposits" stroke="#8884d8" dot={false}/>
                    <Line yAxisId="left" type="monotone" dataKey="dailyOutgoing" name="Withdrawals" stroke="#82ca9d" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="dailyUniqueWallets" name="Unique Wallets" stroke="#ffc658" dot={false}/>
                    </LineChart>
                </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">User Engagement by Net Deposits</h3>
                    <div className="bg-brand-secondary p-4 rounded-lg h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.barChartData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="name" /><YAxis /><Tooltip contentStyle={{ backgroundColor: '#2d3748' }} /><Legend /><Bar dataKey="Users" fill="#8884d8" /></BarChart></ResponsiveContainer></div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Deposit Volume Concentration</h3>
                    <div className="bg-brand-secondary p-4 rounded-lg h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{stats.pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#2d3748' }} /><Legend /></PieChart></ResponsiveContainer></div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div>
        <MobileAccordion icon={BarChart2} title="Analytics">
            <AnalyticsBlock />
        </MobileAccordion>
        <DesktopSection icon={BarChart2} title="Analytics">
            <AnalyticsBlock />
        </DesktopSection>
    </div>
  );
};

export default TSHOTAnalytics;