'use client'

interface ChartData {
  name: string
  value: number
  color: string
  isDashed: boolean
}

interface HistoricalChartProps {
  data: ChartData[]
  title: string
  maxValue?: number
}

export function HistoricalChart({
  data,
  title,
  maxValue = 550,
}: HistoricalChartProps) {
  const chartHeight = 150
  const barWidth = 45

  return (
    <div className="rounded-xl bg-surface border border-border p-4 my-4">
      <div className="text-sm font-semibold text-text-primary mb-1">{title}</div>
      <div className="text-xs text-text-muted mb-4">Río Rímac — m³/s</div>

      {/* Chart SVG */}
      <svg
        width="100%"
        height={chartHeight}
        viewBox="0 0 200 150"
        className="mb-3"
      >
        {/* Y-axis scale reference */}
        <line x1="20" y1="130" x2="190" y2="130" stroke="#475569" strokeWidth="1" />

        {/* Bars and lines */}
        {data.map((item, idx) => {
          const x = 40 + idx * 50
          const heightPercent = (item.value / maxValue) * 120
          const y = 130 - heightPercent

          if (item.isDashed) {
            // Horizontal dashed line
            return (
              <g key={item.name}>
                <line
                  x1="25"
                  y1={y}
                  x2="185"
                  y2={y}
                  stroke={item.color}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  opacity="0.6"
                />
                <text
                  x="195"
                  y={y + 4}
                  fontSize="10"
                  fill={item.color}
                  opacity="0.7"
                >
                  {item.value}
                </text>
              </g>
            )
          }

          // Blue bar for today
          return (
            <g key={item.name}>
              <rect
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={heightPercent}
                fill={item.color}
                opacity="0.8"
                rx="2"
              />
              <text
                x={x}
                y="145"
                fontSize="11"
                fill="#94a3b8"
                textAnchor="middle"
              >
                {item.name}
              </text>
              <text
                x={x}
                y={y - 5}
                fontSize="11"
                fill={item.color}
                fontWeight="bold"
                textAnchor="middle"
              >
                {item.value}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Data Source */}
      <div className="text-xs text-text-muted">Datos: COES · actualizado 06:00</div>
    </div>
  )
}
