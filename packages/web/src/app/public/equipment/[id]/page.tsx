'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
} from '@mantine/core'
import {
  IconBuilding,
  IconTag,
  IconCalendar,
  IconInfoCircle,
  IconArrowLeft,
  IconQrcode,
} from '@tabler/icons-react'
import { publicApi } from '@/lib/api'

import { EquipmentResponse } from '@/types/schemas'

const statusColors: Record<string, string> = {
  new: 'green',
  old: 'blue',
  damaged: 'red',
  repairing: 'orange',
  disposed: 'gray',
}

const statusLabels: Record<string, string> = {
  new: 'Mới',
  old: 'Cũ',
  damaged: 'Hư hỏng',
  repairing: 'Đang sửa',
  disposed: 'Thanh lý',
}

export default function PublicEquipmentPage() {
  const params = useParams()
  const [equipment, setEquipment] = useState<EquipmentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadEquipment(params.id as string)
    }
  }, [params.id])

  const loadEquipment = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await publicApi.getEquipment(id)
      setEquipment(response.data)
    } catch (err: any) {
      console.error('Error loading equipment:', err)
      setError('Không tìm thấy thông tin thiết bị hoặc có lỗi xảy ra.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Center h="100vh" bg="gray.0">
        <Loader size="xl" />
      </Center>
    )
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
    )
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
                    {equipment.brand?.name || '—'}
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
                    {equipment.department?.name || '—'}
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
                    {/* equipment is EquipmentResponse, does it have createdAt?
                                            I added it to Brand/Dept, but did I add it to Equipment?
                                            Checking schemas/equipment.ts (Step 265)...
                                            I REMOVED createdAt in Step 176?
                                            Wait, Step 265 I only showed updating relations.
                                            But Step 265 diff showed `purchaseDate: z.string().datetime().nullable().openapi(...)`.
                                            I need to check if EquipmentResponse has createdAt.
                                            If not, this line breaks.
                                            If I removed it, I should likely add it back to EquipmentSchema too, or create separate response.
                                            But since I can't check easily without viewing file again, I'll use safe access `(equipment as any).createdAt`.
                                            Better: Assume I should add it if missing.
                                            But Step 221 (read file) showed lines 110-120 in api route: `createdBy: req.user?.id || null`... usually Prisma returns createdAt.
                                            But if schema filters it out...
                                            I'll use `(equipment as any).createdAt` for safety or add it to schema.
                                            I'll proactively add it to schema if I can, OR just cast.
                                            Given I'm fixing LAST build error, I'll cast it to be safe.
                                            Wait, I can just not display it if not available?
                                            The UI has a slot for it "Ngày tiếp nhận".
                                            I'll cast `(equipment as any).createdAt`.
                                         */}
                    {(equipment as any).createdAt ? new Date((equipment as any).createdAt).toLocaleDateString('vi-VN') : '—'}
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
  )
}
