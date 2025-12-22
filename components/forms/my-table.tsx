import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
  TableRow,
} from "@/components/ui/table";

// Tipos de datos
type Column<T> = {
    header: string;
    accessor: keyof T;
    className?: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
};

type GenericTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  caption?: string;
  footer?: React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MyTable<T extends Record<string, any>>({
  data,
  columns,
  caption,
  footer,
}: GenericTableProps<T>) {
    return (
        <Table className="mt-2">
            {caption && <TableCaption>{caption}</TableCaption>}
            <TableHeader>
                <TableRow>
                    {columns.map((column) => (
                      <TableHead key={String(column.accessor)} className={`bg-gray-100 text-center font-semibold ${column.className ?? ""}`}>
                        {column.header}
                      </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row, i) => (
                    <TableRow key={i}>
                        {columns.map((col) => (
                            <TableCell key={String(col.accessor)} className={`text-center ${col.className ?? ""}`}>
                                {
                                    col.render 
                                    ? col.render(row[col.accessor], row) 
                                    : String(row[col.accessor])
                                }
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
            {footer && (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={columns.length}>{footer}</TableCell>
                    </TableRow>
                </TableFooter>
            )}
        </Table>
    )
}