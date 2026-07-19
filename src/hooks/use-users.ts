import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.getUsers()
      if (res.error) throw new Error(res.error)
      return res.data!
    },
  })
}
