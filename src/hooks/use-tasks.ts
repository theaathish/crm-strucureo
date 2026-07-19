import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.getTasks()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createTask(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
