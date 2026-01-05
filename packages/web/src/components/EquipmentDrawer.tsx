'use client';

import { useEffect, useMemo } from 'react';
import { Drawer, TextInput, Select, Button, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
    useCreateEquipmentMutation,
    useUpdateEquipmentMutation,
} from '@/hooks/useEquipment';
import { useGetBrandsQuery } from '@/hooks/useBrands';
import { useGetDepartmentsQuery } from '@/hooks/useDepartments';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { equipmentSchema } from '@/lib/schemas';

interface Equipment {
    id: number;
    name: string;
    brand: string | null;
    brand_id: number | null;
    purchaseDate: string | null;
    status: string;
    department_id: number | null;
}

interface EquipmentDrawerProps {
    opened: boolean;
    onClose: () => void;
    equipment: Equipment | null;
}

const statusOptions = [
    { value: 'new', label: 'Mới' },
    { value: 'old', label: 'Cũ' },
    { value: 'damaged', label: 'Hư hỏng' },
    { value: 'repairing', label: 'Đang sửa' },
    { value: 'disposed', label: 'Thanh lý' },
];

export default function EquipmentDrawer({
    opened,
    onClose,
    equipment,
}: EquipmentDrawerProps) {
    const isEditing = !!equipment;
    const { data: brands = [] } = useGetBrandsQuery();
    const { data: departments = [] } = useGetDepartmentsQuery();

    const createMutation = useCreateEquipmentMutation();
    const updateMutation = useUpdateEquipmentMutation();

    // ...

    const form = useForm({
        initialValues: {
            name: '',
            brand_id: '',
            purchase_date: null as Date | null,
            status: 'new',
            department_id: '',
        },
        validate: zod4Resolver(equipmentSchema),
    });

    useEffect(() => {
        if (opened) {
            if (equipment) {
                form.setValues({
                    name: equipment.name,
                    brand_id: equipment.brand_id ? String(equipment.brand_id) : '',
                    purchase_date: equipment.purchaseDate ? new Date(equipment.purchaseDate) : null,
                    status: equipment.status,
                    department_id: equipment.department_id ? String(equipment.department_id) : '',
                });
            } else {
                form.reset();
            }
        }
    }, [opened, equipment]);

    const brandOptions = useMemo(() => {
        return brands.map((b: any) => ({ value: String(b.id), label: b.name }));
    }, [brands]);

    const departmentOptions = useMemo(() => {
        return departments.map((d: any) => ({ value: String(d.id), label: d.name }));
    }, [departments]);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            const data = {
                name: values.name,
                brand_id: values.brand_id ? Number(values.brand_id) : undefined,
                purchase_date: values.purchase_date?.toISOString().split('T')[0],
                status: values.status,
                department_id: values.department_id ? Number(values.department_id) : undefined,
            };

            if (isEditing) {
                await updateMutation.mutateAsync({ id: equipment.id, data });
                notifications.show({
                    title: 'Thành công',
                    message: 'Đã cập nhật thiết bị',
                    color: 'green',
                });
            } else {
                await createMutation.mutateAsync(data);
                notifications.show({
                    title: 'Thành công',
                    message: 'Đã thêm thiết bị mới',
                    color: 'green',
                });
            }

            onClose();
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.error || 'Có lỗi xảy ra',
                color: 'red',
            });
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={isEditing ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
            position="right"
            size="md"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Tên thiết bị"
                        placeholder="VD: Microphone SM58"
                        withAsterisk
                        {...form.getInputProps('name')}
                    />

                    <Select
                        label="Hãng sản xuất"
                        placeholder="Chọn hãng"
                        data={brandOptions}
                        searchable
                        clearable
                        {...form.getInputProps('brand_id')}
                    />

                    <DateInput
                        label="Ngày mua"
                        placeholder="Chọn ngày"
                        valueFormat="DD/MM/YYYY"
                        clearable
                        {...form.getInputProps('purchase_date')}
                    />

                    <Select
                        label="Tình trạng"
                        data={statusOptions}
                        {...form.getInputProps('status')}
                    />

                    <Select
                        label="Bộ phận"
                        placeholder="Chọn bộ phận"
                        clearable
                        data={departmentOptions}
                        {...form.getInputProps('department_id')}
                    />

                    <Button type="submit" fullWidth mt="md" loading={isSubmitting}>
                        {isEditing ? 'Cập nhật' : 'Thêm thiết bị'}
                    </Button>
                </Stack>
            </form>
        </Drawer>
    );
}
