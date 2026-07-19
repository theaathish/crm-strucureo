import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function usePilots() {
  return useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const res = await api.getPilots()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}

export function useCreatePilot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createPilot(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pilots'] }),
  })
}

export function useUpdatePilot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updatePilot(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pilots'] }),
  })
}

export function useDeletePilot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deletePilot(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pilots'] }),
  })
}
