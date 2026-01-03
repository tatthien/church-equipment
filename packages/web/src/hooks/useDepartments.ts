import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '@/lib/api';

export const useGetDepartmentsQuery = () => {
    return useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const { data } = await departmentsApi.getAll();
            return data;
        },
    });
};

// Add mutations if needed later, observing same pattern as Brands
export const useCreateDepartmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; description?: string }) => {
            const { data: response } = await departmentsApi.create(data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
};

export const useUpdateDepartmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: { name?: string; description?: string } }) => {
            const { data: response } = await departmentsApi.update(id, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
};

export const useDeleteDepartmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await departmentsApi.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
};
