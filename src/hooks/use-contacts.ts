import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await api.getContacts()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createContact(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateContact(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteContact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })
}
