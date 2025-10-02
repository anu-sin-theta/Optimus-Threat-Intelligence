"use client"

export function MitreHeatmap() {
  const tactics = [
    "Initial Access",
    "Execution",
    "Persistence",
    "Privilege Escalation",
    "Defense Evasion",
    "Credential Access",
    "Discovery",
    "Lateral Movement",
    "Collection",
    "Exfiltration",
  ]

  const getRandomIntensity = () => Math.floor(Math.random() * 100)

  return (
    <div className="space-y-2">
      {tactics.map((tactic) => {
        const intensity = getRandomIntensity()
        return (
          <div key={tactic} className="flex items-center gap-4">
            <div className="w-40 text-sm text-foreground font-medium">{tactic}</div>
            <div className="flex-1 h-8 rounded-md overflow-hidden bg-secondary">
              <div
                className="h-full transition-all"
                style={{
                  width: `${intensity}%`,
                  backgroundColor:
                    intensity > 70
                      ? "hsl(var(--chart-5))"
                      : intensity > 40
                        ? "hsl(var(--chart-1))"
                        : "hsl(var(--chart-2))",
                }}
              />
            </div>
            <div className="w-12 text-sm text-right font-semibold text-primary">{intensity}%</div>
          </div>
        )
      })}
    </div>
  )
}
