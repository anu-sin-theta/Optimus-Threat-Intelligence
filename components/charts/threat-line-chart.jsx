"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { date: "Jan 1", cves: 45, exploits: 12 },
  { date: "Jan 5", cves: 52, exploits: 18 },
  { date: "Jan 10", cves: 48, exploits: 15 },
  { date: "Jan 15", cves: 67, exploits: 24 },
  { date: "Jan 20", cves: 71, exploits: 28 },
  { date: "Jan 25", cves: 63, exploits: 22 },
  { date: "Jan 30", cves: 78, exploits: 31 },
]

export function ThreatLineChart() {
  return (
    <ChartContainer
      config={{
        cves: {
          label: "CVEs Discovered",
          color: "hsl(var(--chart-1))",
        },
        exploits: {
          label: "Active Exploits",
          color: "hsl(var(--chart-5))",
        },
      }}
      className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} width={40} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line
            type="monotone"
            dataKey="cves"
            stroke="var(--color-cves)"
            strokeWidth={2}
            dot={{ fill: "var(--color-cves)", r: 3 }}
            name="CVEs Discovered"
          />
          <Line
            type="monotone"
            dataKey="exploits"
            stroke="var(--color-exploits)"
            strokeWidth={2}
            dot={{ fill: "var(--color-exploits)", r: 3 }}
            name="Active Exploits"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
