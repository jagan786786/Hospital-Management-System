import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

export interface FilterOptions {
  gender?: string;
  bloodGroup?: string;
  ageRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
}

interface PatientFilterProps {
  onFiltersChange: (filters: FilterOptions) => void;
  activeFilters: FilterOptions;
}

export function PatientFilter({ onFiltersChange, activeFilters }: PatientFilterProps) {
  const [open, setOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(activeFilters);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAgeRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    setTempFilters(prev => ({
      ...prev,
      ageRange: {
        ...prev.ageRange,
        [type]: numValue
      }
    }));
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setTempFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: value || undefined
      }
    }));
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {};
    setTempFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setOpen(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.gender) count++;
    if (activeFilters.bloodGroup) count++;
    if (activeFilters.ageRange?.min !== undefined || activeFilters.ageRange?.max !== undefined) count++;
    if (activeFilters.dateRange?.start || activeFilters.dateRange?.end) count++;
    return count;
  };

  const getFilterSummary = () => {
    const filters = [];
    if (activeFilters.gender) filters.push(`Gender: ${activeFilters.gender}`);
    if (activeFilters.bloodGroup) filters.push(`Blood: ${activeFilters.bloodGroup.toUpperCase()}`);
    if (activeFilters.ageRange?.min !== undefined || activeFilters.ageRange?.max !== undefined) {
      const min = activeFilters.ageRange?.min || 0;
      const max = activeFilters.ageRange?.max || '∞';
      filters.push(`Age: ${min}-${max}`);
    }
    if (activeFilters.dateRange?.start || activeFilters.dateRange?.end) {
      filters.push('Date Range');
    }
    return filters;
  };

  const filterCount = getActiveFilterCount();
  const filterSummary = getFilterSummary();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border relative">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {filterCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              {filterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Patients</DialogTitle>
          <DialogDescription>
            Apply filters to find specific patients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Gender Filter */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select 
              value={tempFilters.gender || ""} 
              onValueChange={(value) => handleFilterChange('gender', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Blood Group Filter */}
          <div className="space-y-2">
            <Label>Blood Group</Label>
            <Select 
              value={tempFilters.bloodGroup || ""} 
              onValueChange={(value) => handleFilterChange('bloodGroup', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All blood groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All blood groups</SelectItem>
                <SelectItem value="a+">A+</SelectItem>
                <SelectItem value="a-">A-</SelectItem>
                <SelectItem value="b+">B+</SelectItem>
                <SelectItem value="b-">B-</SelectItem>
                <SelectItem value="ab+">AB+</SelectItem>
                <SelectItem value="ab-">AB-</SelectItem>
                <SelectItem value="o+">O+</SelectItem>
                <SelectItem value="o-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age Range Filter */}
          <div className="space-y-2">
            <Label>Age Range</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input 
                  type="number" 
                  placeholder="Min age"
                  value={tempFilters.ageRange?.min || ""}
                  onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input 
                  type="number" 
                  placeholder="Max age"
                  value={tempFilters.ageRange?.max || ""}
                  onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Registration Date Range</Label>
            <div className="space-y-2">
              <Input 
                type="date" 
                placeholder="Start date"
                value={tempFilters.dateRange?.start || ""}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
              />
              <Input 
                type="date" 
                placeholder="End date"
                value={tempFilters.dateRange?.end || ""}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {filterSummary.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Active Filters:</Label>
            <div className="flex flex-wrap gap-1">
              {filterSummary.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Button onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}