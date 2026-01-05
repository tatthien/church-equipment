'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Container,
    Paper,
    Title,
    Text,
    Badge,
    Group,
    Stack,
    Loader,
    Center,
    Button,
    Grid,
    ThemeIcon,
    Box,
} from '@mantine/core';
import {
    IconBuilding,
    IconTag,
    IconCalendar,
    IconInfoCircle,
    IconArrowLeft,
    IconQrcode,
} from '@tabler/icons-react';
import { publicApi } from '@/lib/api';

interface Equipment {
    id: number;
    name: string;
    brand_name: string | null;
    department_name: string | null;
    status: string;
    purchaseDate: string | null;
    createdAt: string;
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

export default function PublicEquipmentPage() {
    const params = useParams();
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            loadEquipment(Number(params.id));
        }
    }, [params.id]);

    const loadEquipment = async (id: number) => {
        try {
            setIsLoading(true);
            const response = await publicApi.getEquipment(id);
            setEquipment(response.data);
        } catch (err: any) {
            console.error('Error loading equipment:', err);
            setError('Không tìm thấy thông tin thiết bị hoặc có lỗi xảy ra.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Center h="100vh" bg="gray.0">
                <Loader size="xl" />
            </Center>
        );
    }

    if (error || !equipment) {
        return (
            <Center h="100vh" bg="gray.0">
                <Stack align="center">
                    <ThemeIcon size={80} radius="xl" color="red" variant="light">
                        <IconInfoCircle size={40} />
                    </ThemeIcon>
                    <Title order={3} c="dimmed">
                        {error || 'Không tìm thấy thiết bị'}
                    </Title>
                    <Button variant="light" onClick={() => window.location.href = '/'}>
                        Về trang chủ
                    </Button>
                </Stack>
            </Center>
        );
    }

    return (
        <Box
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: '2rem 1rem',
            }}
        >
            <Container size="sm">
                <Paper shadow="xl" radius="lg" p="xl" withBorder>
                    <Stack gap="xl">
                        {/* Header with Status */}
                        <Group justify="space-between" align="start">
                            <Stack gap="xs">
                                <Title order={2} c="indigo">
                                    {equipment.name}
                                </Title>
                                <Text size="sm" c="dimmed">
                                    ID: #{equipment.id}
                                </Text>
                            </Stack>
                            <Badge
                                size="xl"
                                variant="light"
                                color={statusColors[equipment.status] || 'gray'}
                            >
                                {statusLabels[equipment.status] || equipment.status}
                            </Badge>
                        </Group>

                        {/* Details Grid */}
                        <Grid gutter="lg">
                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Group gap="xs" c="dimmed">
                                        <IconTag size={16} />
                                        <Text size="sm">Hãng sản xuất</Text>
                                    </Group>
                                    <Text fw={500} size="lg">
                                        {equipment.brand_name || '—'}
                                    </Text>
                                </Stack>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Group gap="xs" c="dimmed">
                                        <IconBuilding size={16} />
                                        <Text size="sm">Bộ phận quản lý</Text>
                                    </Group>
                                    <Text fw={500} size="lg">
                                        {equipment.department_name || '—'}
                                    </Text>
                                </Stack>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Group gap="xs" c="dimmed">
                                        <IconCalendar size={16} />
                                        <Text size="sm">Ngày mua</Text>
                                    </Group>
                                    <Text fw={500}>
                                        {equipment.purchaseDate
                                            ? new Date(equipment.purchaseDate).toLocaleDateString('vi-VN')
                                            : '—'}
                                    </Text>
                                </Stack>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Group gap="xs" c="dimmed">
                                        <IconInfoCircle size={16} />
                                        <Text size="sm">Ngày tiếp nhận</Text>
                                    </Group>
                                    <Text fw={500}>
                                        {new Date(equipment.createdAt).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                        </Grid>

                        {/* Footer */}
                        <Center mt="md">
                            <Group>
                                <IconQrcode size={20} color="gray" />
                                <Text size="xs" c="dimmed">
                                    Thông tin này được trích xuất từ hệ thống quản lý thiết bị.
                                </Text>
                            </Group>
                        </Center>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
