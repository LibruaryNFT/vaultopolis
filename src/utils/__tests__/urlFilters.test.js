/**
 * @jest-environment jsdom
 */

import { filtersToSearchParams, searchParamsToFilters } from '../urlFilters';

const DEFAULT_FILTER = {
  selectedSeries: [],
  selectedTiers: ['common', 'fandom'],
  selectedLeague: ['NBA', 'WNBA'],
  selectedSetName: [],
  selectedTeam: [],
  selectedPlayer: [],
  selectedSubedition: [],
  excludeSpecialSerials: true,
  excludeLowSerials: true,
  lockedStatus: 'All',
  sortBy: 'lowest-serial',
  currentPage: 1,
};

describe('urlFilters', () => {
  describe('filtersToSearchParams', () => {
    it('should only include non-default values', () => {
      const filter = {
        ...DEFAULT_FILTER,
        selectedSeries: [2, 3, 4, 5, 6, 7, 8], // All series (default if all available)
        selectedTiers: ['fandom'], // Not default
        selectedLeague: ['NBA', 'WNBA'], // Default
        selectedSetName: [], // Empty (default)
      };

      const seriesOptions = [2, 3, 4, 5, 6, 7, 8];
      const params = filtersToSearchParams(filter, DEFAULT_FILTER, seriesOptions);

      // Should not include series (all selected = default)
      expect(params.has('series')).toBe(false);
      
      // Should include tier (not default)
      expect(params.get('tier')).toBe('fandom');
      
      // Should not include league (default)
      expect(params.has('league')).toBe(false);
      
      // Should not include set (empty = default)
      expect(params.has('set')).toBe(false);
    });

    it('should include series when not all selected', () => {
      const filter = {
        ...DEFAULT_FILTER,
        selectedSeries: [2, 4], // Not all series
      };

      const seriesOptions = [2, 3, 4, 5, 6, 7, 8];
      const params = filtersToSearchParams(filter, DEFAULT_FILTER, seriesOptions);

      expect(params.get('series')).toBe('2,4');
    });

    it('should handle array filters correctly', () => {
      const filter = {
        ...DEFAULT_FILTER,
        selectedSetName: ['Set A', 'Set B'],
        selectedTeam: ['Lakers', 'Warriors'],
      };

      const params = filtersToSearchParams(filter, DEFAULT_FILTER, []);

      expect(params.get('set')).toBe('Set A,Set B');
      expect(params.get('team')).toBe('Lakers,Warriors');
    });
  });

  describe('searchParamsToFilters', () => {
    it('should parse URL params correctly', () => {
      const params = new URLSearchParams('series=2,4&tier=fandom&team=Lakers');
      const filter = searchParamsToFilters(params, DEFAULT_FILTER);

      expect(filter.selectedSeries).toEqual([2, 4]);
      expect(filter.selectedTiers).toEqual(['fandom']);
      expect(filter.selectedTeam).toEqual(['Lakers']);
    });

    it('should handle comma-separated values', () => {
      const params = new URLSearchParams('series=2,3,4&team=Lakers,Warriors');
      const filter = searchParamsToFilters(params, DEFAULT_FILTER);

      expect(filter.selectedSeries).toEqual([2, 3, 4]);
      expect(filter.selectedTeam).toEqual(['Lakers', 'Warriors']);
    });

    it('should handle invalid values gracefully', () => {
      const params = new URLSearchParams('series=abc&tier=lol&page=-5');
      const filter = searchParamsToFilters(params, DEFAULT_FILTER);

      // Invalid series values should be filtered out (NaN filtered)
      expect(filter.selectedSeries).toEqual([]);
      
      // Invalid tier values are accepted (graceful degradation - validation happens in filter logic)
      // The function doesn't validate against available options, it just parses the URL
      expect(filter.selectedTiers).toEqual(['lol']); // Accepted but will result in 0 matches
      
      // Invalid page should be ignored (negative numbers filtered)
      expect(filter.currentPage).toBe(DEFAULT_FILTER.currentPage);
    });

    it('should handle Series 0 correctly', () => {
      const params = new URLSearchParams('series=0,2');
      const filter = searchParamsToFilters(params, DEFAULT_FILTER);

      // Series 0 should be included
      expect(filter.selectedSeries).toContain(0);
      expect(filter.selectedSeries).toContain(2);
    });

    it('should merge with defaults', () => {
      const params = new URLSearchParams('series=2,4');
      const filter = searchParamsToFilters(params, DEFAULT_FILTER);

      // Should have URL values
      expect(filter.selectedSeries).toEqual([2, 4]);
      
      // Should have defaults for other filters
      expect(filter.selectedTiers).toEqual(DEFAULT_FILTER.selectedTiers);
      expect(filter.selectedLeague).toEqual(DEFAULT_FILTER.selectedLeague);
      expect(filter.selectedSetName).toEqual(DEFAULT_FILTER.selectedSetName);
    });
  });
});

