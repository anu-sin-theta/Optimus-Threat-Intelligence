import {
  LayoutDashboard,
  ShieldAlert,
  AlertTriangle,
  BadgeAlert,
  Target,
  FileWarning,
  Globe,
  Newspaper,
  ScrollText,
  FileSearch,
  Settings
} from "lucide-react"

export const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Overview of threat intelligence data",
    icon: LayoutDashboard
  },
  {
    id: "vulnerabilities",
    label: "Vulnerabilities (NVD)",
    description: "National Vulnerability Database entries",
    icon: ShieldAlert
  },
  {
    id: "cisa-kev",
    label: "CISA KEV",
    description: "Known Exploited Vulnerabilities",
    icon: AlertTriangle
  },
  {
    id: "redhat",
    label: "Red Hat Security",
    description: "Red Hat security advisories",
    icon: BadgeAlert
  },
  {
    id: "mitre",
    label: "MITRE ATT&CK",
    description: "Adversary tactics and techniques",
    icon: Target
  },

  {
    id: "iocs",
    label: "Bad IPs",
    description: "Indicators of Compromise",
    icon: Globe
  },
  {
    id: "opti-abused",
    label: "Opti Abused",
    description: "ThreatFox IOCs",
    icon: ShieldAlert
  },
  {
    id: "news",
    label: "Cyber News",
    description: "Latest cybersecurity news",
    icon: Newspaper
  },
  {
    id: "logs",
    label: "Logs",
    description: "System and activity logs",
    icon: ScrollText
  },


]
