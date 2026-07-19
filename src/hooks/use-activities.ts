import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useActivities(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: ['activities', entityType, entityId],
    queryFn: async () => {
      const res = await api.getActivities(entityType, entityId)
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}
