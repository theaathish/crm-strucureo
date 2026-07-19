import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.getNotifications()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
