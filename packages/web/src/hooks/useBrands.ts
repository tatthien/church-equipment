import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from '@/lib/api';
import { CreateBrandRequest } from '@/types/schemas';

export const useGetBrandsQuery = (params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['brands', params],
        queryFn: async () => {
            const { data } = await brandsApi.getAll(params);
            return data;
        },
    });
};

export const useCreateBrandMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateBrandRequest) => {
            const { data: response } = await brandsApi.create(data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};

export const useUpdateBrandMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBrandRequest> }) => {
            const { data: response } = await brandsApi.update(id, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};

export const useDeleteBrandMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await brandsApi.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};
