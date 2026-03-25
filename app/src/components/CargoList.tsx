import { useState, useMemo } from 'react';
import type { CargoRemaining, Cargo } from '@/types';
import { SearchInput } from './SearchInput';
import { CargoItem } from './CargoItem';
import { AddManualCargoDialog } from './AddManualCargoDialog';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

interface CargoListProps {
  cargoRemainings: CargoRemaining[];
  onAddCargo?: (cargo: Cargo) => void;
}

export function CargoList({ cargoRemainings, onAddCargo }: CargoListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredCargos = useMemo(() => {
    if (!searchQuery.trim()) return cargoRemainings;
    
    const query = searchQuery.toLowerCase();
    return cargoRemainings.filter(cr => 
      cr.cargo.name.toLowerCase().includes(query) ||
      cr.cargo.serialNumber.toString().includes(query) ||
      cr.cargo.id.toLowerCase().includes(query)
    );
  }, [cargoRemainings, searchQuery]);

  const completedCount = cargoRemainings.filter(cr => cr.remaining === 0).length;
  const totalCount = cargoRemainings.length;

  const handleConfirmAdd = (cargo: Cargo) => {
    onAddCargo?.(cargo);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">货物清单</h2>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加
          </Button>
        </div>
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索货物名称或编号..."
        />
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>共 {totalCount} 种货物</span>
          <span className="text-green-600">
            已完成 {completedCount} 种
          </span>
        </div>
      </div>

      {/* 货物列表 - 可滚动 */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="p-3 space-y-2">
          {filteredCargos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">未找到匹配的货物</p>
            </div>
          ) : (
            filteredCargos.map((cr) => (
              <CargoItem key={cr.cargo.id} cargoRemaining={cr} />
            ))
          )}
        </div>
      </div>

      {/* 手动添加货物对话框 */}
      <AddManualCargoDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onConfirm={handleConfirmAdd}
        existingCount={totalCount}
      />
    </div>
  );
}
