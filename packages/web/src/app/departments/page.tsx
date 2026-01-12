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
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from '@/hooks/useDepartments'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { departmentSchema } from '@/lib/schemas'
import DataPagination from '@/components/DataPagination'

import { DepartmentResponse, CreateDepartmentRequest } from '@/types/schemas'

export default function DepartmentsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<DepartmentResponse | null>(null)
  const [page, setPage] = useState(1)

  const { data: departmentsResponse, isLoading } = useGetDepartmentsQuery({ page, limit: 20 })
  const departments = departmentsResponse?.data || []
  const pagination = departmentsResponse?.pagination
  const createMutation = useCreateDepartmentMutation()
  const updateMutation = useUpdateDepartmentMutation()
  const deleteMutation = useDeleteDepartmentMutation()

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: zod4Resolver(departmentSchema),
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleOpenModal = (dept: DepartmentResponse | null = null) => {
    if (dept) {
      form.setValues({
        name: dept.name,
        description: dept.description || '',
      })
      setEditingDept(dept)
    } else {
      form.reset()
      setEditingDept(null)
    }
    setModalOpen(true)
  }

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingDept) {
        await updateMutation.mutateAsync({ id: editingDept.id, data: values })
        notifications.show({
          title: 'Thành công',
          message: 'Đã cập nhật bộ phận',
          color: 'green',
        })
      } else {
        await createMutation.mutateAsync(values)
        notifications.show({
          title: 'Thành công',
          message: 'Đã thêm bộ phận mới',
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
    if (!confirm('Bạn có chắc chắn muốn xóa bộ phận này?')) return

    try {
      await deleteMutation.mutateAsync(id)
      notifications.show({
        title: 'Thành công',
        message: 'Đã xóa bộ phận',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể xóa bộ phận',
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
            Quản lý Bộ phận
          </Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => handleOpenModal()}
          >
            Thêm bộ phận
          </Button>
        </Flex>
      </Paper>

      <Paper shadow="sm" radius="md" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : departments.length === 0 ? (
          <Center p="xl">
            <Stack align="center" gap="sm">
              <Text c="dimmed">Không có bộ phận nào</Text>
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() => handleOpenModal()}
              >
                Thêm bộ phận đầu tiên
              </Button>
            </Stack>
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tên bộ phận</Table.Th>
                <Table.Th>Mô tả</Table.Th>
                <Table.Th>Người tạo</Table.Th>
                <Table.Th>Ngày tạo</Table.Th>
                <Table.Th w={100}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {departments.map((dept) => (
                <Table.Tr key={dept.id}>
                  <Table.Td fw={500}>{dept.name}</Table.Td>
                  <Table.Td>{dept.description || '-'}</Table.Td>
                  <Table.Td>{dept.creator?.name || '-'}</Table.Td>
                  <Table.Td>
                    {dept.createdAt ? new Date(dept.createdAt).toLocaleDateString('vi-VN') : '-'}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        onClick={() => handleOpenModal(dept)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(dept.id)}
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
        title={editingDept ? 'Chỉnh sửa bộ phận' : 'Thêm bộ phận mới'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Tên bộ phận"
              placeholder="VD: Âm thanh"
              withAsterisk
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Mô tả"
              placeholder="Mô tả bộ phận..."
              {...form.getInputProps('description')}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              {editingDept ? 'Cập nhật' : 'Thêm bộ phận'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </AppLayout>
  )
}
