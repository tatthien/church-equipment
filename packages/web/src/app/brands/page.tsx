'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Textarea,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  IconPlus,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'
import { useAuth } from '@/lib/auth'
import AppLayout from '@/components/AppLayout'
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from '@/hooks/useBrands'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { brandSchema } from '@/lib/schemas'
import DataPagination from '@/components/DataPagination'

import { BrandResponse, CreateBrandRequest } from '@/types/schemas'

export default function BrandsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<BrandResponse | null>(null)
  const [page, setPage] = useState(1)

  const { data: brandsResponse, isLoading } = useGetBrandsQuery({ page, limit: 20 })
  const brands = brandsResponse?.data || []
  const pagination = brandsResponse?.pagination
  const createMutation = useCreateBrandMutation()
  const updateMutation = useUpdateBrandMutation()
  const deleteMutation = useDeleteBrandMutation()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      description: '',
    },
    validate: zod4Resolver(brandSchema),
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleOpenModal = (brand: BrandResponse | null = null) => {
    if (brand) {
      form.setValues({
        name: brand.name,
        description: brand.description || '',
      })
      setEditingBrand(brand)
    } else {
      form.reset()
      setEditingBrand(null)
    }
    setModalOpen(true)
  }

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingBrand) {
        await updateMutation.mutateAsync({ id: editingBrand.id, data: values })
        notifications.show({
          title: 'Thành công',
          message: 'Đã cập nhật hãng',
          color: 'green',
        })
      } else {
        await createMutation.mutateAsync(values)
        notifications.show({
          title: 'Thành công',
          message: 'Đã thêm hãng mới',
          color: 'green',
        })
      }
      setModalOpen(false)
    } catch (error: any) {
      notifications.show({
        title: 'Lỗi',
        message: error.response?.data?.error || 'Có lỗi xảy ra',
        color: 'red',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hãng này?')) return

    try {
      await deleteMutation.mutateAsync(id)
      notifications.show({
        title: 'Thành công',
        message: 'Đã xóa hãng',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể xóa hãng',
        color: 'red',
      })
    }
  }

  if (authLoading || !user) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    )
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <AppLayout>
      <Paper shadow="sm" p="md" mb="lg" radius="md">
        <Flex justify="space-between" align="center">
          <Title order={3} c="indigo">
            Quản lý Hãng
          </Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => handleOpenModal()}
          >
            Thêm hãng
          </Button>
        </Flex>
      </Paper>

      <Paper shadow="sm" radius="md" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : brands.length === 0 ? (
          <Center p="xl">
            <Stack align="center" gap="sm">
              <Text c="dimmed">Không có hãng nào</Text>
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() => handleOpenModal()}
              >
                Thêm hãng đầu tiên
              </Button>
            </Stack>
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tên hãng</Table.Th>
                <Table.Th>Mô tả</Table.Th>
                <Table.Th>Người tạo</Table.Th>
                <Table.Th>Ngày tạo</Table.Th>
                <Table.Th w={100}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {brands.map((brand) => (
                <Table.Tr key={brand.id}>
                  <Table.Td fw={500}>{brand.name}</Table.Td>
                  <Table.Td>{brand.description || '-'}</Table.Td>
                  <Table.Td>{brand.creator?.name || '-'}</Table.Td>
                  <Table.Td>
                    {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString('vi-VN') : '-'}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        onClick={() => handleOpenModal(brand)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(brand.id)}
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

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBrand ? 'Chỉnh sửa hãng' : 'Thêm hãng mới'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Tên hãng"
              placeholder="VD: Sony"
              key={form.key('name')}
              withAsterisk
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Mô tả"
              placeholder="Mô tả hãng..."
              key={form.key('description')}
              {...form.getInputProps('description')}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              {editingBrand ? 'Cập nhật' : 'Thêm hãng'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </AppLayout>
  )
}
