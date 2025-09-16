import { useState, useEffect, useCallback } from "react";
import { cache } from "@/lib/cache";

interface FetchOptions {
  cacheKey: string;
  cacheTTL?: number;
  dependencies?: any[];
}

export function useOptimizedFetch<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { cacheKey, cacheTTL = 300000, dependencies = [] } = options;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cachedData = cache.get<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        return;
      }

      // Fetch fresh data
      const result = await fetchFn();
      
      // Cache the result
      cache.set(cacheKey, result, cacheTTL);
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error(`Error fetching data for ${cacheKey}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, cacheKey, cacheTTL]);

  const invalidateAndRefresh = useCallback(() => {
    cache.invalidate(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    invalidateAndRefresh
  };
}

export default useOptimizedFetch;