"use client";

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export function ChangeChart({
  data,
}: {
  data: { label: string; baseline: number; scenario: number }[];
}) {
  return (
    <div style={{ height: 60 + data.length * 46 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 52, bottom: 4, left: 4 }}
          barCategoryGap={16}
          barGap={4}
        >
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="label"
            width={64}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5A6A62", fontSize: 11.5 }}
          />
          <Bar
            dataKey="baseline"
            barSize={9}
            radius={[3, 3, 3, 3]}
            fill="#14342B"
            animationDuration={600}
          >
            <LabelList
              dataKey="baseline"
              position="right"
              fill="#5A6A62"
              fontSize={10.5}
              formatter={(value) => Number(value).toFixed(1)}
            />
          </Bar>
          <Bar
            dataKey="scenario"
            barSize={9}
            radius={[3, 3, 3, 3]}
            fill="#B4D95F"
            animationDuration={600}
          >
            <LabelList
              dataKey="scenario"
              position="right"
              fill="#5A6A62"
              fontSize={10.5}
              formatter={(value) => Number(value).toFixed(1)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
