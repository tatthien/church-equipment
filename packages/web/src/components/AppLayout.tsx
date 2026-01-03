'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
    AppShell,
    NavLink,
    Group,
    Title,
    Text,
    Button,
    Divider,
    Box,
    Burger,
    Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconBox,
    IconBuilding,
    IconLogout,
    IconTag,
} from '@tabler/icons-react';
import { useAuth } from '@/lib/auth';

const navItems = [
    { label: 'Thiết bị', href: '/', icon: IconBox },
    { label: 'Hãng', href: '/brands', icon: IconTag },
    { label: 'Bộ phận', href: '/departments', icon: IconBuilding },
];

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            navbar={{
                width: 260,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="lg"
        >
            <AppShell.Navbar p="md">
                <AppShell.Section>
                    <Group gap="xs" mb="lg">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Title order={4} c="indigo">
                            ⛪ Church Equipment
                        </Title>
                    </Group>
                </AppShell.Section>

                <AppShell.Section grow>
                    <Stack gap="xs">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                label={item.label}
                                leftSection={<item.icon size={18} />}
                                active={pathname === item.href}
                                onClick={() => {
                                    router.push(item.href);
                                    if (opened) toggle();
                                }}
                                style={{ borderRadius: 'var(--mantine-radius-md)' }}
                            />
                        ))}
                    </Stack>
                </AppShell.Section>

                <AppShell.Section>
                    <Divider my="sm" />
                    <Box>
                        <Text size="sm" c="dimmed" mb="xs">
                            Xin chào, <strong>{user?.name}</strong>
                        </Text>
                        <Button
                            variant="subtle"
                            color="red"
                            fullWidth
                            leftSection={<IconLogout size={16} />}
                            onClick={logout}
                            justify="flex-start"
                        >
                            Đăng xuất
                        </Button>
                    </Box>
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main
                style={{
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    minHeight: '100vh',
                }}
            >
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
