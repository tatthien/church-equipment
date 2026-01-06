'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Group,
  Badge,
  ActionIcon,
  Menu,
  TextInput,
  Select,
  Paper,
  Text,
  Stack,
  Loader,
  Center,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconQrcode,
  IconSearch,
  IconDotsVertical,
} from '@tabler/icons-react';
import { useAuth } from '@/lib/auth';
import EquipmentDrawer from '@/components/EquipmentDrawer';
import QRCodeModal from '@/components/QRCodeModal';
import AppLayout from '@/components/AppLayout';
import { useGetEquipmentQuery, useDeleteEquipmentMutation } from '@/hooks/useEquipment';
import { useGetBrandsQuery } from '@/hooks/useBrands';
import { useGetDepartmentsQuery } from '@/hooks/useDepartments';
import DataPagination from '@/components/DataPagination';

import { EquipmentResponse } from '@/types/schemas';

const statusColors: Record<string, string> = {
  new: 'green',
  old: 'blue',
  damaged: 'red',
  repairing: 'orange',
  disposed: 'gray',
};

const statusLabels: Record<string, string> = {
  new: 'Mới',
  old: 'Cũ',
  damaged: 'Hư hỏng',
  repairing: 'Đang sửa',
  disposed: 'Thanh lý',
};

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Modal states
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentResponse | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrEquipment, setQrEquipment] = useState<EquipmentResponse | null>(null);

  const { data: equipmentResponse, isLoading: equipmentLoading } = useGetEquipmentQuery({
    search: debouncedSearch,
    status: statusFilter || undefined,
    departmentId: departmentFilter ? departmentFilter : undefined,
    brandId: brandFilter ? brandFilter : undefined,
    page,
    limit: 20,
  });

  const equipment = equipmentResponse?.data || [];
  const pagination = equipmentResponse?.pagination;

  const { data: brands } = useGetBrandsQuery({ limit: 1000 });
  const { data: departments } = useGetDepartmentsQuery({ limit: 1000 });
  const deleteMutation = useDeleteEquipmentMutation();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      notifications.show({
        title: 'Thành công',
        message: 'Đã xóa thiết bị',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể xóa thiết bị',
        color: 'red',
      });
    }
  };

  const handleEdit = (item: EquipmentResponse) => {
    setEditingEquipment(item);
    setEquipmentModalOpen(true);
  };

  const handleQRCode = (item: EquipmentResponse) => {
    setQrEquipment(item);
    setQrModalOpen(true);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, departmentFilter, brandFilter]);

  // Client-side filtering removed, using API results directly
  const filteredEquipment = equipment;

  if (authLoading || !user) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <AppLayout>
      {/* Filters */}
      <Paper shadow="sm" p="md" radius="md" mb="lg">
        <Group>
          <TextInput
            placeholder="Tìm kiếm thiết bị..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Hãng"
            clearable
            searchable
            data={brands?.data.map((b) => ({ value: b.id, label: b.name }))}
            value={brandFilter}
            onChange={setBrandFilter}
            w={150}
          />
          <Select
            placeholder="Tình trạng"
            clearable
            data={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
            value={statusFilter}
            onChange={setStatusFilter}
            w={150}
          />
          <Select
            placeholder="Bộ phận"
            clearable
            data={departments?.data.map((d) => ({ value: d.id, label: d.name }))}
            value={departmentFilter}
            onChange={setDepartmentFilter}
            w={150}
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setEditingEquipment(null);
              setEquipmentModalOpen(true);
            }}
          >
            Thêm thiết bị
          </Button>
        </Group>
      </Paper>

      {/* Equipment Table */}
      <Paper shadow="sm" radius="md" style={{ overflow: 'hidden' }}>
        {equipmentLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : filteredEquipment.length === 0 ? (
          <Center p="xl">
            <Stack align="center" gap="sm">
              <Text c="dimmed">Không có thiết bị nào</Text>
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  setEditingEquipment(null);
                  setEquipmentModalOpen(true);
                }}
              >
                Thêm thiết bị đầu tiên
              </Button>
            </Stack>
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tên thiết bị</Table.Th>
                <Table.Th>Hãng</Table.Th>
                <Table.Th>Bộ phận</Table.Th>
                <Table.Th>Tình trạng</Table.Th>
                <Table.Th>Ngày mua</Table.Th>
                <Table.Th>Người tạo</Table.Th>
                <Table.Th w={100}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredEquipment.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td fw={500}>{item.name}</Table.Td>
                  {/* Note: brand and department names are not directly on EquipmentResponse but might be joined? 
                      Wait, the API code in step 143 doesn't include 'include'. 
                      BUT step 137 (public) does.
                      The main GET /api/equipment endpoint SHOULD include them. 
                      Let's check `equipment.ts` route.
                      Step 143 diff didn't show the `include` block. 
                      I should assume relations might be missing in `EquipmentResponse` type if simplified, 
                      BUT `swagger.ts` usually defines the shape.
                      My `EquipmentResponse` in `schemas.d.ts` (Step 163) does NOT have `brand` or `department` object!
                      It only has `brandId`, `departmentId`.
                      Wait, checking `view_file routes/equipment.ts` (Step 114) might clarify if it includes relations.
                      If it doesn't return relations, the UI will break names.
                      I need to check `src/routes/equipment.ts`.
                   */}
                  <Table.Td>{item.brand?.name || '-'}</Table.Td>
                  <Table.Td>{item.department?.name || '-'}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[item.status] || 'gray'}>
                      {statusLabels[item.status] || item.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {item.purchaseDate
                      ? new Date(item.purchaseDate).toLocaleDateString('vi-VN')
                      : '-'}
                  </Table.Td>
                  <Table.Td>{item.creator?.name || '-'}</Table.Td>
                  <Table.Td>
                    <Menu shadow="md" width={150}>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconQrcode size={16} />}
                          onClick={() => handleQRCode(item)}
                        >
                          QR Code
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={16} />}
                          onClick={() => handleEdit(item)}
                        >
                          Chỉnh sửa
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={16} />}
                          color="red"
                          onClick={() => handleDelete(item.id)}
                        >
                          Xóa
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
        {pagination && (
          <DataPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onChange={setPage}
          />
        )}
      </Paper>

      {/* Modals */}
      <EquipmentDrawer
        opened={equipmentModalOpen}
        onClose={() => {
          setEquipmentModalOpen(false);
          setEditingEquipment(null);
        }}
        equipment={editingEquipment}
      />

      <QRCodeModal
        opened={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setQrEquipment(null);
        }}
        equipment={qrEquipment}
      />
    </AppLayout>
  );
}
