import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await api.getLeads()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createLead(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateLead(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteLead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })
}
