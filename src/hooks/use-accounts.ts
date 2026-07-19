import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.getAccounts()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createAccount(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateAccount(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteAccount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}
