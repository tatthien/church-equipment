import { useGetBrandsQuery } from "@/hooks/useBrands";
import { Select, SelectProps } from "@mantine/core";
import { useMemo } from "react";

type Props = SelectProps

export function BrandSelect({ ...props }: Props) {
  const { data: brands } = useGetBrandsQuery({ limit: 1000 });
  const brandOptions = useMemo(() => {
    return brands?.data.map((b: any) => ({ value: b.id, label: b.name }));
  }, [brands]);
  return (
    <Select
      {...props}
      data={brandOptions}
    />
  )
}
