/**
 * @jest-environment jsdom
 */

// Note: These are logic tests that verify the filter behavior
// Full integration tests would require React Testing Library setup
// For now, we'll create manual verification tests

import { filtersToSearchParams, searchParamsToFilters } from '../../utils/urlFilters';

// Mock WNBA_TEAMS
const WNBA_TEAMS = [
  'Atlanta Dream', 'Chicago Sky', 'Connecticut Sun', 'Dallas Wings',
  'Indiana Fever', 'Las Vegas Aces', 'Los Angeles Sparks', 'Minnesota Lynx',
  'New York Liberty', 'Phoenix Mercury', 'Seattle Storm', 'Washington Mystics'
];

// Test data
const createMockMoment = (overrides = {}) => ({
  id: '1',
  series: 2,
  tier: 'common',
  teamAtMoment: 'Lakers',
  name: 'Set A',
  fullName: 'LeBron James',
  subeditionID: 0,
  isLocked: false,
  serialNumber: 100,
  subeditionMaxMint: 1000,
  momentCount: 1000,
  jerseyNumber: null,
  ...overrides
});

describe('useMomentFilters - Core Logic Tests', () => {
  describe('ensureInOpts function', () => {
    // We need to test this indirectly through the hook
    // Since it's not exported, we'll test its behavior through options generation
    
    it('should handle empty arrays correctly', () => {
      const moments = [
        createMockMoment({ id: '1', name: 'Set A' }),
        createMockMoment({ id: '2', name: 'Set B' }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedSetName: [], // Empty array
        })
      );

      // Empty array should result in all sets being available
      expect(result.current.setNameOptions).toContain('Set A');
      expect(result.current.setNameOptions).toContain('Set B');
    });

    it('should handle array selections correctly', () => {
      const moments = [
        createMockMoment({ id: '1', name: 'Set A' }),
        createMockMoment({ id: '2', name: 'Set B' }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedSetName: ['Set A'], // Array selection
        })
      );

      // Selected set should be in options
      expect(result.current.setNameOptions).toContain('Set A');
      expect(result.current.setNameOptions).toContain('Set B');
    });
  });

  describe('Filter passes() logic', () => {
    it('should exclude locked moments when showLockedMoments=false', () => {
      const moments = [
        createMockMoment({ id: '1', isLocked: false }),
        createMockMoment({ id: '2', isLocked: true }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          showLockedMoments: false,
        })
      );

      // Only unlocked moments should be in eligibleMoments
      const unlockedCount = result.current.eligibleMoments.filter(m => !m.isLocked).length;
      const totalCount = result.current.eligibleMoments.length;
      
      expect(unlockedCount).toBe(totalCount); // All should be unlocked
      expect(result.current.eligibleMoments.some(m => m.isLocked)).toBe(false);
    });

    it('should include locked moments when showLockedMoments=true', () => {
      const moments = [
        createMockMoment({ id: '1', isLocked: false }),
        createMockMoment({ id: '2', isLocked: true }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          showLockedMoments: true,
        })
      );

      // Both locked and unlocked should be included
      expect(result.current.eligibleMoments.length).toBeGreaterThan(0);
    });

    it('should filter by series correctly', () => {
      const moments = [
        createMockMoment({ id: '1', series: 2 }),
        createMockMoment({ id: '2', series: 3 }),
        createMockMoment({ id: '3', series: 2 }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedSeries: [2],
        })
      );

      // Only series 2 should be included
      expect(result.current.eligibleMoments.every(m => m.series === 2)).toBe(true);
      expect(result.current.eligibleMoments.length).toBe(2);
    });

    it('should return 0 results when series is empty (required filter)', () => {
      const moments = [
        createMockMoment({ id: '1', series: 2 }),
        createMockMoment({ id: '2', series: 3 }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedSeries: [], // Empty = no matches for required filters
        })
      );

      expect(result.current.eligibleMoments.length).toBe(0);
    });

    it('should filter by tier correctly', () => {
      const moments = [
        createMockMoment({ id: '1', tier: 'common' }),
        createMockMoment({ id: '2', tier: 'fandom' }),
        createMockMoment({ id: '3', tier: 'common' }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedTiers: ['fandom'],
        })
      );

      // Only fandom should be included
      expect(result.current.eligibleMoments.every(m => m.tier === 'fandom')).toBe(true);
      expect(result.current.eligibleMoments.length).toBe(1);
    });

    it('should filter by set correctly (empty array = all)', () => {
      const moments = [
        createMockMoment({ id: '1', name: 'Set A' }),
        createMockMoment({ id: '2', name: 'Set B' }),
        createMockMoment({ id: '3', name: 'Set A' }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedSetName: [], // Empty = all sets
        })
      );

      // All sets should be included
      expect(result.current.eligibleMoments.length).toBe(3);
    });

    it('should filter by set correctly (array selection)', () => {
      const moments = [
        createMockMoment({ id: '1', name: 'Set A' }),
        createMockMoment({ id: '2', name: 'Set B' }),
        createMockMoment({ id: '3', name: 'Set A' }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedSetName: ['Set A'], // Only Set A
        })
      );

      // Only Set A should be included
      expect(result.current.eligibleMoments.every(m => m.name === 'Set A')).toBe(true);
      expect(result.current.eligibleMoments.length).toBe(2);
    });

    it('should handle Series 0 correctly', () => {
      const moments = [
        createMockMoment({ id: '1', series: 0 }), // Series 0
        createMockMoment({ id: '2', series: 2 }),
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedSeries: [0, 2],
        })
      );

      // Series 0 should be included
      expect(result.current.eligibleMoments.some(m => m.series === 0)).toBe(true);
      expect(result.current.eligibleMoments.length).toBe(2);
    });
  });

  describe('Base Collections (baseNoX)', () => {
    it('baseNoSet should omit set filter but apply others', () => {
      const moments = [
        createMockMoment({ id: '1', series: 2, tier: 'common', name: 'Set A' }),
        createMockMoment({ id: '2', series: 2, tier: 'common', name: 'Set B' }),
        createMockMoment({ id: '3', series: 3, tier: 'common', name: 'Set A' }), // Different series
        createMockMoment({ id: '4', series: 2, tier: 'fandom', name: 'Set A' }), // Different tier
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedSeries: [2],
          selectedTiers: ['common'],
          selectedSetName: ['Set A'], // This should be omitted in baseNoSet
        })
      );

      // baseNoSet should include all sets from Series 2, common
      // Should include both Set A and Set B (set filter omitted)
      const baseNoSet = result.current.base.baseNoSet;
      expect(baseNoSet.length).toBe(2); // Set A and Set B from Series 2, common
      expect(baseNoSet.every(m => m.series === 2)).toBe(true);
      expect(baseNoSet.every(m => m.tier === 'common')).toBe(true);
    });

    it('baseNoSeries should omit series filter but apply others', () => {
      const moments = [
        createMockMoment({ id: '1', series: 2, tier: 'common', name: 'Set A' }),
        createMockMoment({ id: '2', series: 3, tier: 'common', name: 'Set A' }),
        createMockMoment({ id: '3', series: 2, tier: 'fandom', name: 'Set A' }), // Different tier
        createMockMoment({ id: '4', series: 2, tier: 'common', name: 'Set B' }), // Different set
      ];

      const { result } = renderHook(() =>
        useMomentFilters({
          nftDetails: moments,
          selectedSeries: [2], // This should be omitted in baseNoSeries
          selectedTiers: ['common'],
          selectedSetName: ['Set A'],
        })
      );

      // baseNoSeries should include all series from common, Set A
      // Should include both Series 2 and 3 (series filter omitted)
      const baseNoSeries = result.current.base.baseNoSeries;
      expect(baseNoSeries.length).toBe(2); // Series 2 and 3 from common, Set A
      expect(baseNoSeries.every(m => m.tier === 'common')).toBe(true);
      expect(baseNoSeries.every(m => m.name === 'Set A')).toBe(true);
    });
  });

  describe('Filter Cascading', () => {
    it('should update counts when tier changes', () => {
      const moments = [
        createMockMoment({ id: '1', series: 2, tier: 'common', name: 'Set A' }),
        createMockMoment({ id: '2', series: 2, tier: 'common', name: 'Set B' }),
        createMockMoment({ id: '3', series: 2, tier: 'fandom', name: 'Set A' }),
        createMockMoment({ id: '4', series: 2, tier: 'fandom', name: 'Set B' }),
      ];

      const { result, rerender } = renderHook(
        ({ selectedTiers }) =>
          useMomentFilters({
            nftDetails: moments,
            selectedSeries: [2],
            selectedTiers,
            selectedSetName: [],
          }),
        {
          initialProps: { selectedTiers: ['common', 'fandom'] },
        }
      );

      const initialSetACount = result.current.base.baseNoSet.filter(m => m.name === 'Set A').length;

      // Change to fandom only
      rerender({ selectedTiers: ['fandom'] });

      const updatedSetACount = result.current.base.baseNoSet.filter(m => m.name === 'Set A').length;

      // Count should update (only fandom moments now)
      expect(updatedSetACount).toBeLessThanOrEqual(initialSetACount);
      expect(updatedSetACount).toBe(1); // Only one fandom Set A
    });
  });
});

