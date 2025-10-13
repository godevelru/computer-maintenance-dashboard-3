import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

export interface ReportField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

export interface ReportConfig {
  name: string;
  description: string;
  fields: string[];
  filters: ReportFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: string;
}

interface ReportBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableFields: ReportField[];
  onSave: (config: ReportConfig) => void;
  initialConfig?: ReportConfig;
}

export const ReportBuilder = ({
  open,
  onOpenChange,
  availableFields,
  onSave,
  initialConfig,
}: ReportBuilderProps) => {
  const [name, setName] = useState(initialConfig?.name || '');
  const [description, setDescription] = useState(initialConfig?.description || '');
  const [selectedFields, setSelectedFields] = useState<string[]>(initialConfig?.fields || []);
  const [filters, setFilters] = useState<ReportFilter[]>(initialConfig?.filters || []);
  const [sortBy, setSortBy] = useState(initialConfig?.sortBy || '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialConfig?.sortOrder || 'asc');
  const [groupBy, setGroupBy] = useState(initialConfig?.groupBy || '');

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((f) => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleAddFilter = () => {
    setFilters([
      ...filters,
      { field: availableFields[0]?.key || '', operator: 'equals', value: '' },
    ]);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index: number, key: keyof ReportFilter, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [key]: value };
    setFilters(newFilters);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Укажите название отчета');
      return;
    }

    if (selectedFields.length === 0) {
      toast.error('Выберите хотя бы одно поле');
      return;
    }

    const config: ReportConfig = {
      name,
      description,
      fields: selectedFields,
      filters,
      sortBy: sortBy || undefined,
      sortOrder,
      groupBy: groupBy || undefined,
    };

    onSave(config);
    onOpenChange(false);
    toast.success('Отчет сохранен');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Конструктор отчетов</DialogTitle>
          <DialogDescription>
            Настройте параметры отчета: выберите поля, добавьте фильтры и сортировку
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Название отчета</Label>
              <Input
                id="report-name"
                placeholder="Например: Отчет по заявкам за месяц"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-desc">Описание</Label>
              <Textarea
                id="report-desc"
                placeholder="Краткое описание отчета"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Поля для отчета</Label>
                  <Badge variant="secondary">
                    {selectedFields.length} из {availableFields.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {availableFields.map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.key}
                        checked={selectedFields.includes(field.key)}
                        onCheckedChange={() => handleFieldToggle(field.key)}
                      />
                      <label
                        htmlFor={field.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Фильтры</Label>
                  <Button size="sm" variant="outline" onClick={handleAddFilter}>
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </div>

                {filters.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Фильтры не добавлены
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filters.map((filter, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Select
                            value={filter.field}
                            onValueChange={(v) => handleFilterChange(index, 'field', v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Поле" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields.map((field) => (
                                <SelectItem key={field.key} value={field.key}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={filter.operator}
                            onValueChange={(v) => handleFilterChange(index, 'operator', v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Равно</SelectItem>
                              <SelectItem value="contains">Содержит</SelectItem>
                              <SelectItem value="greater">Больше</SelectItem>
                              <SelectItem value="less">Меньше</SelectItem>
                              <SelectItem value="between">Между</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder="Значение"
                            value={filter.value}
                            onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveFilter(index)}
                        >
                          <Icon name="X" className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Сортировка и группировка</Label>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Сортировать по</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Без сортировки" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Без сортировки</SelectItem>
                        {availableFields.map((field) => (
                          <SelectItem key={field.key} value={field.key}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Порядок</Label>
                    <Select
                      value={sortOrder}
                      onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}
                      disabled={!sortBy}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">По возрастанию</SelectItem>
                        <SelectItem value="desc">По убыванию</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Группировать по</Label>
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Без группировки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Без группировки</SelectItem>
                      {availableFields.map((field) => (
                        <SelectItem key={field.key} value={field.key}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <Icon name="Save" className="h-4 w-4 mr-2" />
              Сохранить отчет
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
