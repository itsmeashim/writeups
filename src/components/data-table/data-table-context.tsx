import { useLocalStorage } from "@mantine/hooks"
import type { ColumnDef } from "@tanstack/react-table"
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { createContext, useContext, useState } from "react"

interface DataTableContextType<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  columns: ColumnDef<TData, any>[]
  data: TData[]
  total: number
  isLoading: boolean
}

export const DataTableContext = createContext<DataTableContextType<any>>({
  table: {} as any,
  columns: [],
  data: [],
  total: 0,
  isLoading: false,
})

export function DataTableProvider<TData>({
  children,
  columns,
  data,
  total,
  isLoading,
}: {
  children: (props: {
    table: ReturnType<typeof useReactTable<TData>>
    columns: ColumnDef<TData, any>[]
    data: TData[]
    total: number
    isLoading: boolean
  }) => React.ReactNode
  columns: ColumnDef<TData, any>[]
  data: TData[]
  total: number
  isLoading: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>({
      key: "columnVisibility",
      defaultValue: {},
    })
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    rowCount: total ?? 0,
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <DataTableContext.Provider
      value={{ table, columns, data, total, isLoading }}
    >
      {children({ table, columns, data, total, isLoading })}
    </DataTableContext.Provider>
  )
}

export const useDataTable = () => {
  const context = useContext(DataTableContext)
  if (!context) {
    throw new Error("useDataTable must be used within a DataTableProvider")
  }
  return context
}
