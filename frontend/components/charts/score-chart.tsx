"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export function ScoreChart({
  data,
  accent = false,
}: {
  data: { crop: string; score: number }[];
  accent?: boolean;
}) {
  return (
    <div style={{ height: 56 + data.length * 44 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 56, bottom: 4, left: 4 }}
          barCategoryGap={14}
        >
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="crop"
            width={118}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#16241F", fontSize: 12.5 }}
          />
          <Bar
            dataKey="score"
            barSize={12}
            radius={[4, 4, 4, 4]}
            isAnimationActive
            animationDuration={700}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.crop}
                fill={
                  accent
                    ? index === 0
                      ? "#1F4D3D"
                      : "#B4D95F"
                    : index === 0
                      ? "#14342B"
                      : "#2A6350"
                }
                fillOpacity={accent ? 1 : index === 0 ? 1 : 0.8 - index * 0.14}
              />
            ))}
            <LabelList
              dataKey="score"
              position="right"
              fill="#5A6A62"
              fontSize={11.5}
              formatter={(value) => `${Number(value).toFixed(1)}%`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ImportanceChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <div style={{ height: 40 + data.length * 30 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 52, bottom: 4, left: 4 }}
          barCategoryGap={8}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={168}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5A6A62", fontSize: 10.5 }}
          />
          <Bar dataKey="value" barSize={8} radius={[4, 4, 4, 4]} fill="#2A6350">
            <LabelList
              dataKey="value"
              position="right"
              fill="#5A6A62"
              fontSize={10.5}
              formatter={(value) => Number(value).toFixed(3)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
