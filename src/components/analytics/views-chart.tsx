"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ViewsChartProps {
  data: Array<{
    view_date: string;
    views: number;
    unique_viewers: number;
  }>;
}

export function ViewsChart({ data }: ViewsChartProps) {
  // Reverse to show oldest first (left to right chronologically)
  const chartData = [...data].reverse().map((item) => ({
    date: new Date(item.view_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    views: item.views,
    unique_viewers: item.unique_viewers,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="#94a3b8"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
          formatter={(value) => value}
          labelStyle={{ color: "#1e293b" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ fill: "#f97316", r: 4 }}
          activeDot={{ r: 6 }}
          name="Total Views"
        />
        <Line
          type="monotone"
          dataKey="unique_viewers"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ fill: "#0ea5e9", r: 4 }}
          activeDot={{ r: 6 }}
          name="Unique Viewers"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
