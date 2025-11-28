/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import MultiSelectFilterPopover from '../MultiSelectFilterPopover';

describe('MultiSelectFilterPopover', () => {
  const defaultProps = {
    label: 'Test Filter',
    selectedValues: [],
    options: ['Option A', 'Option B', 'Option C'],
    onChange: jest.fn(),
    placeholder: 'Search...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty Array Behavior', () => {
    it('should show "All" when emptyMeansAll=true and selectedValues is empty', () => {
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={[]}
          emptyMeansAll={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('All');
    });

    it('should show "None" when emptyMeansAll=false and selectedValues is empty', () => {
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={[]}
          emptyMeansAll={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('None');
    });
  });

  describe('"All" Checkbox State', () => {
    it('should show "All" as checked when all options selected', () => {
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={['Option A', 'Option B', 'Option C']}
          emptyMeansAll={false}
        />
      );

      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Check "All" checkbox
      const allCheckbox = screen.getByText('All').closest('[role="option"]').querySelector('input[type="checkbox"]');
      expect(allCheckbox).toBeChecked();
    });

    it('should show "All" as checked when emptyMeansAll=true and selectedValues is empty', () => {
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={[]}
          emptyMeansAll={true}
        />
      );

      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Check "All" checkbox
      const allCheckbox = screen.getByText('All').closest('[role="option"]').querySelector('input[type="checkbox"]');
      expect(allCheckbox).toBeChecked();
    });

    it('should show "All" as unchecked when partial selection', () => {
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={['Option A']}
          emptyMeansAll={false}
        />
      );

      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Check "All" checkbox
      const allCheckbox = screen.getByText('All').closest('[role="option"]').querySelector('input[type="checkbox"]');
      expect(allCheckbox).not.toBeChecked();
    });
  });

  describe('Selection Behavior', () => {
    it('should call onChange when selecting an option', () => {
      const onChange = jest.fn();
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={[]}
          onChange={onChange}
        />
      );

      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Select an option
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA);

      expect(onChange).toHaveBeenCalledWith(['Option A']);
    });

    it('should call onChange when deselecting an option', () => {
      const onChange = jest.fn();
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={['Option A']}
          onChange={onChange}
        />
      );

      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Deselect option
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('should call onChange with all options when clicking "All"', () => {
      const onChange = jest.fn();
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={[]}
          onChange={onChange}
        />
      );

      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Click "All"
      const allOption = screen.getByText('All');
      fireEvent.click(allOption);

      expect(onChange).toHaveBeenCalledWith(['Option A', 'Option B', 'Option C']);
    });
  });

  describe('Summary Display', () => {
    it('should show single selection', () => {
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={['Option A']}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Option A');
    });

    it('should show multiple selections', () => {
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={['Option A', 'Option B']}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Option A, Option B');
    });

    it('should show "All" when all selected', () => {
      render(
        <MultiSelectFilterPopover
          {...defaultProps}
          selectedValues={['Option A', 'Option B', 'Option C']}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('All');
    });
  });
});

