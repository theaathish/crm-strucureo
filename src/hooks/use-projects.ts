import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.getProjects()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createProject(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateProject(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}
