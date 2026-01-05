'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Paper,
    Title,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Stack,
    Center,
    Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBuildingChurch } from '@tabler/icons-react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        initialValues: {
            username: '',
            password: '',
        },
        validate: {
            username: (value) => (value.length < 3 ? 'Tên đăng nhập phải có ít nhất 3 ký tự' : null),
            password: (value) => (value.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setIsLoading(true);
        try {
            await login(values.username, values.password);
            notifications.show({
                title: 'Thành công',
                message: 'Đăng nhập thành công!',
                color: 'green',
            });
        } catch (error: any) {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.error || 'Có lỗi xảy ra',
                color: 'red',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container size={420}>
                <Center mb="xl">
                    <Box style={{ textAlign: 'center', color: 'white' }}>
                        <IconBuildingChurch size={64} stroke={1.5} />
                        <Title order={2} mt="sm">
                            Church Equipment
                        </Title>
                        <Text size="sm" opacity={0.8}>
                            Quản lý thiết bị nhà thờ
                        </Text>
                    </Box>
                </Center>

                <Paper withBorder shadow="xl" p={30} radius="lg">
                    <Title order={3} ta="center" mb="lg">
                        Đăng nhập
                    </Title>

                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="md">
                            <TextInput
                                label="Tên đăng nhập"
                                placeholder="username"
                                required
                                {...form.getInputProps('username')}
                            />

                            <PasswordInput
                                label="Mật khẩu"
                                placeholder="••••••"
                                required
                                {...form.getInputProps('password')}
                            />

                            <Button type="submit" fullWidth mt="md" loading={isLoading}>
                                Đăng nhập
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}
