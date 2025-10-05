'use client'

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function ThreatLineChart({ data }) {
  return (
    <ChartContainer
      config={{
        cves: {
          label: 'CVEs Discovered',
          color: 'yellow',
        },
        exploits: {
          label: 'Active Exploits',
          color: 'red',
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
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="cves"
            stroke="var(--color-cves)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-cves)', r: 3 }}
            name="CVEs Discovered"
          />
          <Line
            type="monotone"
            dataKey="exploits"
            stroke="var(--color-exploits)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-exploits)', r: 3 }}
            name="Active Exploits"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}