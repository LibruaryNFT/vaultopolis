import React, { useState, useMemo } from "react";
import { Search, ChevronDown, X } from "lucide-react";

const MomentFilters = ({ nftDetails, onFilterChange }) => {
  const [showSetsDropdown, setShowSetsDropdown] = useState(false);
  const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);
  const [searchSet, setSearchSet] = useState("");
  const [searchSeries, setSearchSeries] = useState("");
  const [selectedSets, setSelectedSets] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);

  // Extract unique sets and series
  const { uniqueSets, uniqueSeries } = useMemo(() => {
    const sets = new Map();
    const series = new Map();

    nftDetails?.forEach((nft) => {
      if (nft.setName && !sets.has(nft.setName)) {
        sets.set(nft.setName, { id: nft.setID, name: nft.setName });
      }
      if (nft.seriesID && !series.has(nft.seriesID)) {
        series.set(nft.seriesID, {
          id: nft.seriesID,
          name: `Series ${nft.seriesID}`,
        });
      }
    });

    return {
      uniqueSets: Array.from(sets.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
      uniqueSeries: Array.from(series.values()).sort(
        (a, b) => parseInt(b.id) - parseInt(a.id)
      ),
    };
  }, [nftDetails]);

  const filteredSets = uniqueSets.filter((set) =>
    set.name.toLowerCase().includes(searchSet.toLowerCase())
  );

  const filteredSeries = uniqueSeries.filter((series) =>
    series.name.toLowerCase().includes(searchSeries.toLowerCase())
  );

  const toggleSet = (setId) => {
    const newSelection = selectedSets.includes(setId)
      ? selectedSets.filter((id) => id !== setId)
      : [...selectedSets, setId];
    setSelectedSets(newSelection);
    onFilterChange({ selectedSets: newSelection, selectedSeries });
  };

  const toggleSeries = (seriesId) => {
    const newSelection = selectedSeries.includes(seriesId)
      ? selectedSeries.filter((id) => id !== seriesId)
      : [...selectedSeries, seriesId];
    setSelectedSeries(newSelection);
    onFilterChange({ selectedSets, selectedSeries: newSelection });
  };

  const clearSetSelections = () => {
    setSelectedSets([]);
    onFilterChange({ selectedSets: [], selectedSeries });
  };

  const clearSeriesSelections = () => {
    setSelectedSeries([]);
    onFilterChange({ selectedSets, selectedSeries: [] });
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Sets Filter */}
      <div className="relative">
        <button
          onClick={() => setShowSetsDropdown(!showSetsDropdown)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
        >
          <span>
            {selectedSets.length
              ? `${selectedSets.length} Sets Selected`
              : "Select Sets"}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showSetsDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg">
            <div className="p-2 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sets..."
                  value={searchSet}
                  onChange={(e) => setSearchSet(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredSets.map((set) => (
                <div
                  key={set.id}
                  onClick={() => toggleSet(set.id)}
                  className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSets.includes(set.id)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  <span className="text-gray-300">{set.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSets.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSets.map((setId) => {
              const set = uniqueSets.find((s) => s.id === setId);
              return (
                <span
                  key={setId}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-sm"
                >
                  {set?.name}
                  <button
                    onClick={() => toggleSet(setId)}
                    className="hover:text-gray-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearSetSelections}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Series Filter */}
      <div className="relative">
        <button
          onClick={() => setShowSeriesDropdown(!showSeriesDropdown)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
        >
          <span>
            {selectedSeries.length
              ? `${selectedSeries.length} Series Selected`
              : "Select Series"}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showSeriesDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg">
            <div className="p-2 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search series..."
                  value={searchSeries}
                  onChange={(e) => setSearchSeries(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredSeries.map((series) => (
                <div
                  key={series.id}
                  onClick={() => toggleSeries(series.id)}
                  className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSeries.includes(series.id)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  <span className="text-gray-300">{series.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSeries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSeries.map((seriesId) => {
              const series = uniqueSeries.find((s) => s.id === seriesId);
              return (
                <span
                  key={seriesId}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-sm"
                >
                  {series?.name}
                  <button
                    onClick={() => toggleSeries(seriesId)}
                    className="hover:text-gray-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearSeriesSelections}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentFilters;
