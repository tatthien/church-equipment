'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    Button,
    Group,
    ActionIcon,
    TextInput,
    Paper,
    Text,
    Stack,
    Loader,
    Center,
    Flex,
    Modal,
    Title,
    Select,
    PasswordInput,
    Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
    IconPlus,
    IconEdit,
    IconTrash,
    IconSearch,
} from '@tabler/icons-react';
import { useAuth } from '@/lib/auth';
import AppLayout from '@/components/AppLayout';
import {
    useGetUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} from '@/hooks/useUsers';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { userCreateSchema, userUpdateSchema } from '@/lib/schemas';

interface User {
    id: number;
    username: string;
    name: string;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [search, setSearch] = useState('');

    const { data: users = [], isLoading } = useGetUsersQuery();
    const createMutation = useCreateUserMutation();
    const updateMutation = useUpdateUserMutation();
    const deleteMutation = useDeleteUserMutation();

    // ...

    const form = useForm({
        initialValues: {
            username: '',
            password: '',
            name: '',
            role: 'user',
        },
        validate: zod4Resolver(editingUser ? userUpdateSchema : userCreateSchema),
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'admin') {
                notifications.show({
                    title: 'Lỗi',
                    message: 'Bạn không có quyền truy cập trang này',
                    color: 'red',
                });
                router.push('/');
            }
        }
    }, [user, authLoading, router]);

    const handleOpenModal = (user: User | null = null) => {
        if (user) {
            form.setValues({
                username: user.username,
                password: '', // Password empty on edit
                name: user.name,
                role: user.role,
            });
            setEditingUser(user);
        } else {
            form.reset();
            setEditingUser(null);
        }
        setModalOpen(true);
    };

    const handleSubmit = async (values: typeof form.values) => {
        try {
            if (editingUser) {
                // Remove password if empty to avoid updating it
                const updateData: any = { ...values };
                if (!updateData.password) delete updateData.password;

                await updateMutation.mutateAsync({ id: editingUser.id, data: updateData });
                notifications.show({
                    title: 'Thành công',
                    message: 'Đã cập nhật người dùng',
                    color: 'green',
                });
            } else {
                await createMutation.mutateAsync(values);
                notifications.show({
                    title: 'Thành công',
                    message: 'Đã thêm người dùng mới',
                    color: 'green',
                });
            }
            setModalOpen(false);
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.error || 'Có lỗi xảy ra',
                color: 'red',
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

        try {
            await deleteMutation.mutateAsync(id);
            notifications.show({
                title: 'Thành công',
                message: 'Đã xóa người dùng',
                color: 'green',
            });
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.error || 'Không thể xóa',
                color: 'red',
            });
        }
    };

    const filteredUsers = users.filter((u: User) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    if (authLoading || !user || user.role !== 'admin') {
        return (
            <Center h="100vh">
                <Loader size="xl" />
            </Center>
        );
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <AppLayout>
            <Paper shadow="sm" p="md" mb="lg" radius="md">
                <Flex justify="space-between" align="center">
                    <Title order={3} c="indigo">
                        Quản lý Người dùng
                    </Title>
                    <Group>
                        <TextInput
                            placeholder="Tìm kiếm..."
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={() => handleOpenModal()}
                        >
                            Thêm người dùng
                        </Button>
                    </Group>
                </Flex>
            </Paper>

            <Paper shadow="sm" radius="md" style={{ overflow: 'hidden' }}>
                {isLoading ? (
                    <Center p="xl">
                        <Loader />
                    </Center>
                ) : (
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Username</Table.Th>
                                <Table.Th>Tên hiển thị</Table.Th>
                                <Table.Th>Vai trò</Table.Th>
                                <Table.Th>Ngày tạo</Table.Th>
                                <Table.Th w={100}></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredUsers.map((u: User) => (
                                <Table.Tr key={u.id}>
                                    <Table.Td fw={500}>{u.username}</Table.Td>
                                    <Table.Td>{u.name}</Table.Td>
                                    <Table.Td>
                                        <Badge color={u.role === 'admin' ? 'blue' : 'green'}>
                                            {u.role}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <ActionIcon
                                                variant="subtle"
                                                onClick={() => handleOpenModal(u)}
                                            >
                                                <IconEdit size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => handleDelete(u.id)}
                                                disabled={u.id === user.id} // Prevent deleting self via UI (backend also blocks)
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Paper>

            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            label="Username"
                            placeholder="username"
                            withAsterisk
                            {...form.getInputProps('username')}
                        // readOnly={!!editingUser} // Can allow update if backend supports it
                        />
                        <TextInput
                            label="Tên hiển thị"
                            placeholder="Họ Tên"
                            withAsterisk
                            {...form.getInputProps('name')}
                        />
                        <PasswordInput
                            label="Mật khẩu"
                            placeholder={editingUser ? 'Để trống nếu không đổi' : 'Mật khẩu'}
                            withAsterisk
                            {...form.getInputProps('password')}
                        />
                        <Select
                            label="Vai trò"
                            data={[
                                { value: 'user', label: 'User' },
                                { value: 'admin', label: 'Admin' },
                            ]}
                            {...form.getInputProps('role')}
                        />
                        <Button type="submit" fullWidth loading={isSubmitting}>
                            {editingUser ? 'Cập nhật' : 'Thêm người dùng'}
                        </Button>
                    </Stack>
                </form>
            </Modal>
        </AppLayout>
    );
}
