// components/MonthlyRevenueChart.tsx
import { MonthlyRevenue } from "@constant/types";
import { formatMoneyShort } from "@utils/format";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  YAxis,
} from "recharts";

// Label tiền nằm dưới chân cột
function ValueBelow(props: any) {
  const { x = 0, y = 0, width = 0, height = 0, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y + height + 18}
      textAnchor="middle"
      style={{ fill: "#212121", fontWeight: 600 }}
    >
      {value}
    </text>
  );
}
function OnlyActualTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const actualItem = payload.find((p: any) => p.dataKey === "actual");
  if (!actualItem) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        padding: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Tháng {label}</div>
      <div style={{ color: "#24AB70", fontWeight: 600 }}>
        Doanh thu: {formatMoneyShort(actualItem.value)}
      </div>
    </div>
  );
}
export default function MonthlyRevenueChart({
  data,
}: {
  data: MonthlyRevenue;
}) {
  if (!data?.months?.length) return null;

  // Headroom 16px: đặt domain cao hơn max tương đương ~16px
  const max = Math.max(...data.months.map((d) => d.revenue), 1);
  const TARGET = max * 1.12; // ~12% để tương đương ~16px trên chiều cao 304px

  const chartData = data.months.map((d) => ({
    label: d.label,
    actual: d.revenue,
    gap: Math.max(0, TARGET - d.revenue),
    valueText: formatMoneyShort(d.revenue),
  }));

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          barCategoryGap={16}
          margin={{ top: 16, right: 0, bottom: 30, left: 0 }}
          stackOffset="none"
        >
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={22}
          />
          {/* KHÔNG hiển thị trục y, set trần để có headroom 16px */}
          <YAxis hide domain={[0, TARGET]} />

          {/* 1) Phần xanh ở DƯỚI, không bo góc */}
          <Bar
            dataKey="actual"
            stackId="a"
            fill="#24AB70"
            radius={[0, 0, 0, 0]}
          >
            <LabelList dataKey="valueText" content={<ValueBelow />} />
          </Bar>

          {/* 2) Phần xám ở TRÊN, bo góc trên */}
          <Bar
            dataKey="gap"
            stackId="a"
            fill="#E0E0E0"
            radius={[12, 12, 0, 0]}
          />

          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            content={<OnlyActualTooltip />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
