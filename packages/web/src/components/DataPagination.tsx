import { Pagination, Group, Text } from '@mantine/core'

interface DataPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function DataPagination({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: DataPaginationProps) {
  if (totalPages <= 1) return null

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <Group justify="space-between" p={10}>
      <Text size="sm" c="dimmed">
        Hiển thị {start}-{end} trong tổng số {total} mục
      </Text>
      <Pagination value={page} onChange={onChange} total={totalPages} />
    </Group>
  )
}
