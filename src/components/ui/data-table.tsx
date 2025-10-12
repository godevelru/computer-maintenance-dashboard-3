import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { Card, CardContent } from "@/components/ui/card";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface Filter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter[];
  searchKeys?: string[];
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  renderActions?: (item: T) => React.ReactNode;
  itemsPerPageOptions?: number[];
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filters = [],
  searchKeys = [],
  searchPlaceholder = "Поиск...",
  onRowClick,
  renderActions,
  itemsPerPageOptions = [10, 25, 50, 100],
  emptyMessage = "Нет данных для отображения",
  loading = false
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Применяем поиск
    if (searchQuery && searchKeys.length > 0) {
      result = result.filter(item =>
        searchKeys.some(key => {
          const value = String(item[key] || '').toLowerCase();
          return value.includes(searchQuery.toLowerCase());
        })
      );
    }

    // Применяем фильтры
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        result = result.filter(item => String(item[filterKey]) === filterValue);
      }
    });

    // Применяем сортировку
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, searchKeys, activeFilters, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (columnKey: string) => {
    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        return prev.direction === 'asc' 
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [filterKey]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Панель поиска и фильтров */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Поиск */}
              <div className="relative flex-1">
                <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-11 border-border/50 focus:border-primary transition-colors"
                />
              </div>

              {/* Фильтры */}
              {filters.map(filter => (
                <Select
                  key={filter.key}
                  value={activeFilters[filter.key] || 'all'}
                  onValueChange={(value) => handleFilterChange(filter.key, value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-11 border-border/50">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все {filter.label.toLowerCase()}</SelectItem>
                    {filter.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}

              {/* Кнопка сброса фильтров */}
              {(searchQuery || Object.values(activeFilters).some(v => v && v !== 'all')) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilters({});
                    setCurrentPage(1);
                  }}
                  className="h-11 gap-2 border-border/50"
                >
                  <Icon name="X" className="h-4 w-4" />
                  Сбросить
                </Button>
              )}
            </div>

            {/* Информация и настройки */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Показано <span className="font-medium text-foreground">{paginatedData.length}</span> из{' '}
                <span className="font-medium text-foreground">{filteredAndSortedData.length}</span> записей
              </div>
              <div className="flex items-center gap-2">
                <span>Строк на странице:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {itemsPerPageOptions.map(option => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`p-4 text-left font-semibold text-sm ${column.width || ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {column.sortable ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {column.label}
                          {sortConfig?.key === column.key && (
                            <Icon
                              name={sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown'}
                              className="h-4 w-4"
                            />
                          )}
                        </button>
                      ) : (
                        column.label
                      )}
                    </div>
                  </th>
                ))}
                {renderActions && (
                  <th className="p-4 text-left font-semibold text-sm w-[120px]">
                    Действия
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (renderActions ? 1 : 0)} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Icon name="Loader2" className="h-5 w-5 animate-spin" />
                      <span>Загрузка...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (renderActions ? 1 : 0)} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Icon name="Inbox" className="h-12 w-12 opacity-20" />
                      <p className="text-lg font-medium">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b last:border-0 transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-muted/50' : 'hover:bg-muted/30'
                    }`}
                  >
                    {columns.map(column => (
                      <td key={column.key} className="p-4">
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                    {renderActions && (
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {renderActions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-2"
              >
                <Icon name="ChevronLeft" className="h-4 w-4" />
                Назад
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-muted-foreground">
                      {page}
                    </span>
                  )
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Вперед
                <Icon name="ChevronRight" className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
