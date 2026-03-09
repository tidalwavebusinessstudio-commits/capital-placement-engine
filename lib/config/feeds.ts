// ============================================================
// RSS Feed Configuration — Sources for deal discovery
// ============================================================

export interface FeedConfig {
  id: string;
  name: string;
  url: string;
  sector: string;
  enabled: boolean;
  checkInterval: number; // minutes
  lastCheckedAt: string | null;
}

// Pre-configured RSS feeds for capital markets / CRE / infrastructure news
export const DEFAULT_FEEDS: FeedConfig[] = [
  {
    id: "feed-dcd",
    name: "Data Center Dynamics",
    url: "https://www.datacenterdynamics.com/en/rss/",
    sector: "data_center",
    enabled: true,
    checkInterval: 60,
    lastCheckedAt: null,
  },
  {
    id: "feed-bisnow",
    name: "Bisnow National",
    url: "https://www.bisnow.com/national/news/rss",
    sector: "cre",
    enabled: true,
    checkInterval: 60,
    lastCheckedAt: null,
  },
  {
    id: "feed-hospitality",
    name: "Hotel News Now",
    url: "https://www.hotelnewsnow.com/rss",
    sector: "hospitality",
    enabled: true,
    checkInterval: 120,
    lastCheckedAt: null,
  },
  {
    id: "feed-renewable",
    name: "Renewable Energy World",
    url: "https://www.renewableenergyworld.com/feed/",
    sector: "energy",
    enabled: true,
    checkInterval: 120,
    lastCheckedAt: null,
  },
  {
    id: "feed-globest",
    name: "GlobeSt CRE",
    url: "https://www.globest.com/feed/",
    sector: "cre",
    enabled: false,
    checkInterval: 120,
    lastCheckedAt: null,
  },
];

// Keywords that indicate a relevant capital-seeking project
export const RELEVANCE_KEYWORDS = [
  // Capital structure
  "seeking capital", "equity partner", "debt financing", "capital raise",
  "mezz", "mezzanine", "preferred equity", "joint venture", "JV",
  "construction loan", "bridge loan", "capital stack",
  // Deal signals
  "ground-up", "development", "breaking ground", "acquisition",
  "refinance", "recapitalization", "funding gap",
  // Scale indicators
  "million", "$M", "MW", "megawatt", "acres", "square feet",
  "keys", "units", "rooms",
];

// Keywords that indicate low relevance
export const EXCLUSION_KEYWORDS = [
  "opinion", "editorial", "podcast", "webinar", "conference recap",
  "job posting", "hiring",
];
