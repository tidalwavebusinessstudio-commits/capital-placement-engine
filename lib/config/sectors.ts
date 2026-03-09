import type { Sector } from "@/lib/types";

export interface SectorConfig {
  id: Sector;
  label: string;
  priority: number; // 1 = highest priority
  scoreWeight: number; // 0-100, used in deal scoring
  color: string; // Tailwind color class suffix
  icon: string; // emoji for quick visual ID
  keywords: string[]; // search/matching keywords
}

export const SECTORS: Record<Sector, SectorConfig> = {
  data_center: {
    id: "data_center",
    label: "Data Centers",
    priority: 1,
    scoreWeight: 100,
    color: "violet",
    icon: "🖥️",
    keywords: [
      "data center", "hyperscale", "colocation", "server farm",
      "AI infrastructure", "compute campus", "MW capacity",
      "edge computing", "GPU cluster",
    ],
  },
  cre: {
    id: "cre",
    label: "Commercial Real Estate",
    priority: 2,
    scoreWeight: 85,
    color: "blue",
    icon: "🏢",
    keywords: [
      "multifamily", "mixed-use", "office", "retail",
      "industrial", "logistics", "warehouse", "commercial development",
    ],
  },
  hospitality: {
    id: "hospitality",
    label: "Hospitality",
    priority: 3,
    scoreWeight: 75,
    color: "amber",
    icon: "🏨",
    keywords: [
      "hotel", "resort", "hospitality", "convention center",
      "branded hotel", "flag hotel", "RevPAR",
    ],
  },
  energy: {
    id: "energy",
    label: "Energy",
    priority: 4,
    scoreWeight: 70,
    color: "green",
    icon: "⚡",
    keywords: [
      "solar", "wind", "battery storage", "renewable",
      "power plant", "transmission", "utility", "hydrogen",
      "PPA", "interconnection",
    ],
  },
  infrastructure: {
    id: "infrastructure",
    label: "Infrastructure",
    priority: 5,
    scoreWeight: 65,
    color: "slate",
    icon: "🌉",
    keywords: [
      "infrastructure", "bridge", "airport", "highway",
      "water treatment", "waste", "PPP", "public-private",
    ],
  },
  manufacturing: {
    id: "manufacturing",
    label: "Manufacturing",
    priority: 6,
    scoreWeight: 60,
    color: "orange",
    icon: "🏭",
    keywords: [
      "manufacturing", "factory", "assembly", "production facility",
      "semiconductor", "fabrication", "processing plant",
    ],
  },
  tech: {
    id: "tech",
    label: "Technology",
    priority: 7,
    scoreWeight: 55,
    color: "cyan",
    icon: "💻",
    keywords: [
      "tech campus", "R&D facility", "innovation center",
      "lab space", "biotech",
    ],
  },
};

export const SECTOR_LIST = Object.values(SECTORS).sort((a, b) => a.priority - b.priority);

export function getSectorLabel(sector: Sector): string {
  return SECTORS[sector]?.label ?? sector;
}

export function getSectorConfig(sector: Sector): SectorConfig {
  return SECTORS[sector];
}
