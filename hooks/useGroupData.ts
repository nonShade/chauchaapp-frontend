import { useState, useEffect, useCallback } from 'react';
import { getFamilyGroup } from '../services/api/groups';
import { FamilyGroupResponseDTO } from '../types/group';

export const useGroupData = () => {
  const [group, setGroup] = useState<FamilyGroupResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFamilyGroup();
      setGroup(data);
    } catch (err: any) {
      console.error('[useGroupData] Error fetching group data:', err);
      setError(err.message || 'Error al cargar el grupo familiar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  return {
    group,
    isLoading,
    error,
    hasGroup: group !== null,
    refetch: fetchGroupData,
  };
};
