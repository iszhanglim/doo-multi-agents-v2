import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface ClassItem {
  id: string;
  name: string;
}

export function useClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getClasses();
      setClasses(res.classes);
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取班级列表失败';
      setError(message);
      console.warn('API获取班级列表失败:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, error, refetch: fetchClasses };
}