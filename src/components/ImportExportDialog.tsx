import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { exportData, importData, detectFileFormat, type ExportFormat, type ImportFormat } from '@/lib/dataImportExport';
import { toast } from 'sonner';

interface ImportExportDialogProps {
  data: any[];
  columns?: { key: string; label: string }[];
  title?: string;
  filename: string;
  onImport?: (data: any[]) => void;
  trigger?: React.ReactNode;
}

export const ImportExportDialog = ({
  data,
  columns,
  title,
  filename,
  onImport,
  trigger,
}: ImportExportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await exportData({
        filename,
        format: exportFormat,
        data,
        columns,
        title,
      });
      toast.success(`Данные экспортированы в ${exportFormat.toUpperCase()}`);
    } catch (error) {
      toast.error('Ошибка при экспорте данных');
      console.error(error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const format = detectFileFormat(file);
      if (!format) {
        toast.error('Неподдерживаемый формат файла');
        return;
      }

      const result = await importData(file, format);

      if (result.errors && result.errors.length > 0) {
        toast.error(`Ошибки при импорте: ${result.errors.join(', ')}`);
      }

      if (result.data.length > 0) {
        onImport?.(result.data);
        toast.success(`Импортировано ${result.data.length} записей`);
        setOpen(false);
      } else {
        toast.error('Не удалось импортировать данные');
      }
    } catch (error) {
      toast.error('Ошибка при импорте данных');
      console.error(error);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Icon name="FileUp" className="h-4 w-4 mr-2" />
            Импорт/Экспорт
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Импорт и экспорт данных</DialogTitle>
          <DialogDescription>
            Загрузите данные из файла или экспортируйте в различные форматы
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">
              <Icon name="Download" className="h-4 w-4 mr-2" />
              Экспорт
            </TabsTrigger>
            <TabsTrigger value="import">
              <Icon name="Upload" className="h-4 w-4 mr-2" />
              Импорт
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Формат экспорта</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center">
                      <Icon name="FileSpreadsheet" className="h-4 w-4 mr-2 text-green-600" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center">
                      <Icon name="FileText" className="h-4 w-4 mr-2 text-blue-600" />
                      CSV (.csv)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center">
                      <Icon name="Code" className="h-4 w-4 mr-2 text-yellow-600" />
                      JSON (.json)
                    </div>
                  </SelectItem>
                  <SelectItem value="xml">
                    <div className="flex items-center">
                      <Icon name="FileCode" className="h-4 w-4 mr-2 text-orange-600" />
                      XML (.xml)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center">
                      <Icon name="FileType" className="h-4 w-4 mr-2 text-red-600" />
                      PDF (.pdf)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <Icon name="Info" className="h-4 w-4" />
              <AlertDescription>
                Будет экспортировано {data.length} записей
              </AlertDescription>
            </Alert>

            <Button onClick={handleExport} className="w-full">
              <Icon name="Download" className="h-4 w-4 mr-2" />
              Экспортировать
            </Button>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Выберите файл</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.xml,.xlsx,.xls"
                onChange={handleImport}
                disabled={importing}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
              />
            </div>

            <Alert>
              <Icon name="FileCheck" className="h-4 w-4" />
              <AlertDescription>
                Поддерживаются форматы: CSV, JSON, XML, Excel (XLSX/XLS)
              </AlertDescription>
            </Alert>

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Советы по импорту:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Убедитесь, что колонки файла совпадают со структурой данных</li>
                <li>CSV файлы должны использовать UTF-8 кодировку</li>
                <li>Excel файлы читаются с первого листа</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
