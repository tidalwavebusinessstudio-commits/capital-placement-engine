// Business constants
export const PARTNER_FEE_MIN = 4; // percent
export const PARTNER_FEE_MAX = 8;
export const KEVIN_SHARE_PCT = 50; // percent of partner fee
export const PREFERRED_DEAL_MIN = 20_000_000; // $20M
export const PREFERRED_DEAL_MAX = 250_000_000; // $250M
export const DEAL_ABSOLUTE_MIN = 5_000_000; // $5M floor

// Scoring
export const SCORE_MAX = 100;
export const SCORE_HIGH_THRESHOLD = 80;
export const SCORE_MEDIUM_THRESHOLD = 60;

// Outreach limits
export const MAX_OUTREACH_PER_CONTACT_PER_WEEK = 2;

// Data center top markets (for scoring geographic desirability)
export const DC_TOP_MARKETS = [
  "Northern Virginia",
  "Dallas",
  "Phoenix",
  "Atlanta",
  "Chicago",
  "Silicon Valley",
  "Portland",
  "Salt Lake City",
  "Columbus",
  "Hillsboro",
];

// US states
export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];
