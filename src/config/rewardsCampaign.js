/**
 * TSHOT Rewards Campaign Configuration
 * 
 * Update this file when starting a new campaign.
 * Both /rewards/tshot and /guides/tshot-rewards read from this config.
 */

export const currentCampaign = {
  // Campaign identification
  id: 'tshot-rewards-oct25',
  name: 'TSHOT Rewards Program',
  
  // Campaign dates
  startDate: 'Oct 21, 2025',
  startDateISO: '2025-10-21', // ISO format for Date parsing
  endDate: 'Jan 13, 2026',
  durationWeeks: 12,
  
  // Reward amounts
  totalRewards: 22500, // FLOW
  baseWeeklyAmount: 1500, // FLOW
  superchargedAmount: 3000, // FLOW
  
  // Supercharged weeks (week numbers and dates)
  superchargedWeeks: [
    {
      week: 1,
      name: 'NBA Tip-Off',
      dates: 'Oct 21–27'
    },
    {
      week: 6,
      name: 'Thanksgiving Games',
      dates: 'Nov 25–Dec 1'
    },
    {
      week: 10,
      name: 'Christmas Day Games',
      dates: 'Dec 23–29'
    }
  ],
  
  // Eligibility notes
  eligibility: {
    requiresStaking: false,
    requiresBridging: true, // Must be on Flow EVM
    excludedWallets: {
      description: 'Team, treasury, and LP wallets',
      amount: 96718, // TSHOT
      eligibleSupply: 24564 // TSHOT
    }
  },
  
  // External links
  merklUrl: 'https://app.merkl.xyz/opportunities/flow/ERC20LOGPROCESSOR/0xC618a7356FcF601f694C51578CD94144Deaee690',
  
  // Last updated date (for disclosure page)
  lastUpdated: 'Nov 2025'
};

/**
 * Helper function to format campaign date range
 */
export function getCampaignDateRange() {
  return `${currentCampaign.startDate} – ${currentCampaign.endDate}`;
}

/**
 * Helper function to format campaign duration text
 */
export function getCampaignDurationText() {
  return `${currentCampaign.startDate} - ${currentCampaign.endDate} (${currentCampaign.durationWeeks} weeks total)`;
}

