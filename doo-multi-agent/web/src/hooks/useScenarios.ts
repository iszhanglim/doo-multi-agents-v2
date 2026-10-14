import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface ScenarioItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function useScenarios(enabledOnly = true) {
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getScenarios();
      const list = enabledOnly ? res.scenarios.filter((s) => s.enabled) : res.scenarios;
      setScenarios(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取场景库失败';
      setError(message);
      console.warn('API获取场景库失败:', message);
    } finally {
      setLoading(false);
    }
  }, [enabledOnly]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  return { scenarios, loading, error, refetch: fetchScenarios };
}