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

interface Equipment {
    id: number;
    name: string;
    brand: string | null;
    brand_id: number | null;
    brand_name: string | null;
    purchaseDate: string | null;
    createdAt: string;
    status: string;
    department_id: number | null;
    department_name: string | null;
    created_by_name: string | null;
}

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

    // Modal states
    const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrEquipment, setQrEquipment] = useState<Equipment | null>(null);

    const { data: equipment = [], isLoading: equipmentLoading } = useGetEquipmentQuery({
        search: debouncedSearch,
        status: statusFilter || undefined,
        department_id: departmentFilter ? Number(departmentFilter) : undefined,
        brand_id: brandFilter ? Number(brandFilter) : undefined,
    });

    const { data: brands = [] } = useGetBrandsQuery();
    const { data: departments = [] } = useGetDepartmentsQuery();
    const deleteMutation = useDeleteEquipmentMutation();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleDelete = async (id: number) => {
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

    const handleEdit = (item: Equipment) => {
        setEditingEquipment(item);
        setEquipmentModalOpen(true);
    };

    const handleQRCode = (item: Equipment) => {
        setQrEquipment(item);
        setQrModalOpen(true);
    };

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
                        data={brands.map((b: any) => ({ value: String(b.id), label: b.name }))}
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
                        data={departments.map((d: any) => ({ value: String(d.id), label: d.name }))}
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
                            {filteredEquipment.map((item: Equipment) => (
                                <Table.Tr key={item.id}>
                                    <Table.Td fw={500}>{item.name}</Table.Td>
                                    <Table.Td>{item.brand_name || item.brand || '-'}</Table.Td>
                                    <Table.Td>{item.department_name || '-'}</Table.Td>
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
                                    <Table.Td>{item.created_by_name || '-'}</Table.Td>
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
