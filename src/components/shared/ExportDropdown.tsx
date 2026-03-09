import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";

interface ExportColumn {
  header: string;
  key: string;
}

interface ExportDropdownProps {
  title: string;
  filename: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
}

export default function ExportDropdown({ title, filename, columns, data }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportToPDF({ title, columns, data, filename })}>
          Exportar a PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel({ title, columns, data, filename })}>
          Exportar a Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
