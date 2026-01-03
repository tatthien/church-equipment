import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from '@/lib/api';

export const useGetBrandsQuery = () => {
    return useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const { data } = await brandsApi.getAll();
            return data;
        },
    });
};

export const useCreateBrandMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; description?: string }) => {
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
        mutationFn: async ({ id, data }: { id: number; data: { name?: string; description?: string } }) => {
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
        mutationFn: async (id: number) => {
            await brandsApi.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};
