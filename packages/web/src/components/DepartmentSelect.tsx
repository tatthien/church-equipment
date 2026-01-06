import { useGetDepartmentsQuery } from '@/hooks/useDepartments'
import { Select, SelectProps } from '@mantine/core'
import { useMemo } from 'react'

type Props = SelectProps

export function DepartmentSelect(props: Props) {
  const { data: departments } = useGetDepartmentsQuery({ limit: 1000 })
  const departmentOptions = useMemo(() => {
    return departments?.data.map((d) => ({ value: d.id, label: d.name }))
  }, [departments])
  return (
    <Select
      {...props}
      data={departmentOptions}
    />
  )
}
