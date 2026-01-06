import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentsApi } from '@/lib/api'
import { CreateDepartmentRequest } from '@/types/schemas'

export const useGetDepartmentsQuery = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: async () => {
      const { data } = await departmentsApi.getAll(params)
      return data
    },
  })
}

// Add mutations if needed later, observing same pattern as Brands
export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateDepartmentRequest) => {
      const { data: response } = await departmentsApi.create(data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateDepartmentRequest> }) => {
      const { data: response } = await departmentsApi.update(id, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await departmentsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}
