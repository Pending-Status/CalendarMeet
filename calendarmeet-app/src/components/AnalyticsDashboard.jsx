import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const AnalyticsCard = ({ title, value, accent }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <p className="text-sm text-gray-500 font-semibold">{title}</p>
    <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
    <div className="mt-3 h-1.5 rounded-full" style={{ background: accent }} />
  </div>
);

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState({ totalEvents: 0, totalUsers: 0, totalRsvps: 0 });
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/summary");
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-600 to-yellow-500 text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-white/80">Overview of events, users, and engagement</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSummary}
            disabled={loading}
            className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full font-semibold hover:bg-white/25 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            to="/"
            className="bg-white text-green-700 px-5 py-2 rounded-full font-semibold hover:bg-green-50 transition"
          >
            Back Home
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <AnalyticsCard title="Total Events" value={summary.totalEvents ?? 0} accent="#22c55e" />
        <AnalyticsCard title="Total Users" value={summary.totalUsers ?? 0} accent="#fbbf24" />
        <AnalyticsCard title="Total RSVPs" value={summary.totalRsvps ?? 0} accent="#60a5fa" />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
