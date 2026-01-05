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
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { loginSchema } from '@/lib/schemas';

export default function LoginPage() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            password: '',
        },
        validate: zod4Resolver(loginSchema),
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
            <Container size={400} flex={1}>
                <Center mb="xl">
                    <Box style={{ textAlign: 'center', color: 'white' }}>
                        <IconBuildingChurch size={64} stroke={1.5} />
                        <Title order={2} mt="sm">
                            Church Equipment
                        </Title>
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
                                key={form.key('username')}
                                {...form.getInputProps('username')}
                            />

                            <PasswordInput
                                label="Mật khẩu"
                                placeholder="••••••"
                                key={form.key('password')}
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
