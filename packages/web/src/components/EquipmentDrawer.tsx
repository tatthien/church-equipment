'use client';

import { useEffect } from 'react';
import { Drawer, TextInput, Select, Button, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
} from '@/hooks/useEquipment';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { equipmentSchema } from '@/lib/schemas';
import { BrandSelect } from './BrandSelect';
import { DepartmentSelect } from './DepartmentSelect';

interface Equipment {
  id: number;
  name: string;
  brand: any;
  purchaseDate: string | null;
  createdAt: string;
  status: string;
  department: any;
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

  const createMutation = useCreateEquipmentMutation();
  const updateMutation = useUpdateEquipmentMutation();

  const form = useForm({
    initialValues: {
      name: '',
      brandId: '',
      purchaseDate: null as Date | null,
      status: 'new',
      departmentId: '',
    },
    validate: zod4Resolver(equipmentSchema),
  });

  useEffect(() => {
    if (opened) {
      if (equipment) {
        form.setValues({
          name: equipment.name,
          brandId: equipment.brand ? equipment.brand.id : '',
          purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate) : null,
          status: equipment.status,
          departmentId: equipment.department ? equipment.department.id : '',
        });
      } else {
        form.reset();
      }
    }
  }, [opened, equipment]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const data = {
        name: values.name,
        brandId: values.brandId ? values.brandId : undefined,
        purchaseDate: values.purchaseDate?.toISOString(),
        status: values.status,
        departmentId: values.departmentId ? values.departmentId : undefined,
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

          <BrandSelect
            label="Hãng sản xuất"
            placeholder="Chọn hãng"
            searchable
            clearable
            {...form.getInputProps('brandId')}
          />

          <DateInput
            label="Ngày mua"
            placeholder="Chọn ngày"
            valueFormat="DD/MM/YYYY"
            clearable
            {...form.getInputProps('purchaseDate')}
          />

          <Select
            label="Tình trạng"
            data={statusOptions}
            {...form.getInputProps('status')}
          />

          <DepartmentSelect
            label="Bộ phận"
            placeholder="Chọn bộ phận"
            clearable
            {...form.getInputProps('departmentId')}
          />

          <Button type="submit" fullWidth mt="md" loading={isSubmitting}>
            {isEditing ? 'Cập nhật' : 'Thêm thiết bị'}
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}
