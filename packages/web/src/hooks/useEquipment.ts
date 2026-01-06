import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentApi } from '@/lib/api';
import { CreateEquipmentRequest } from '@/types/schemas';

export const useGetEquipmentQuery = (params?: {
  status?: string;
  departmentId?: string;
  brandId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['equipment', params],
    queryFn: async () => {
      const { data } = await equipmentApi.getAll(params);
      return data;
    },
  });
};

export const useGetEquipmentByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const { data } = await equipmentApi.getById(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateEquipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEquipmentRequest) => {
      const { data: response } = await equipmentApi.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

export const useUpdateEquipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateEquipmentRequest>;
    }) => {
      const { data: response } = await equipmentApi.update(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

export const useDeleteEquipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await equipmentApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};
