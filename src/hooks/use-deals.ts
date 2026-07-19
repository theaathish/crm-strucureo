import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const res = await api.getDeals()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createDeal(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateDeal(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  })
}

export function useDeleteDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteDeal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  })
}
