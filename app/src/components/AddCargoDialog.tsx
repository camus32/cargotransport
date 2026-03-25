import { useState, useMemo } from 'react';
import type { CargoRemaining } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Weight, Plus, Trash2, Ruler } from 'lucide-react';

interface AddCargoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargoRemainings: CargoRemaining[];
  onConfirm: (selections: { cargoId: string; quantity: number }[]) => void;
}

interface SelectedItem {
  cargoId: string;
  quantity: number;
}

export function AddCargoDialog({ 
  open, 
  onOpenChange, 
  cargoRemainings, 
  onConfirm 
}: AddCargoDialogProps) {
  const [selections, setSelections] = useState<SelectedItem[]>([]);

  // 只显示有剩余的货物
  const availableCargos = useMemo(() => {
    return cargoRemainings.filter(cr => cr.remaining > 0);
  }, [cargoRemainings]);

  // 获取货物信息
  const getCargoInfo = (cargoId: string) => {
    return cargoRemainings.find(cr => cr.cargo.id === cargoId);
  };

  // 获取已选货物ID集合
  const selectedCargoIds = useMemo(() => {
    return new Set(selections.map(s => s.cargoId));
  }, [selections]);

  // 添加一行选择
  const addSelectionRow = () => {
    const firstAvailable = availableCargos.find(cr => !selectedCargoIds.has(cr.cargo.id));
    if (firstAvailable) {
      setSelections(prev => [...prev, { cargoId: firstAvailable.cargo.id, quantity: 1 }]);
    }
  };

  // 移除一行选择
  const removeSelectionRow = (index: number) => {
    setSelections(prev => prev.filter((_, i) => i !== index));
  };

  // 更新选择的货物
  const updateCargoId = (index: number, cargoId: string) => {
    setSelections(prev => prev.map((item, i) => 
      i === index ? { ...item, cargoId, quantity: 1 } : item
    ));
  };

  // 更新数量
  const updateQuantity = (index: number, quantity: number) => {
    const cargoInfo = getCargoInfo(selections[index].cargoId);
    if (cargoInfo) {
      const maxQty = cargoInfo.remaining;
      const validQty = Math.max(1, Math.min(quantity, maxQty));
      setSelections(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity: validQty } : item
      ));
    }
  };

  // 确认添加
  const handleConfirm = () => {
    const validSelections = selections.filter(s => s.cargoId && s.quantity > 0);
    if (validSelections.length > 0) {
      onConfirm(validSelections);
      setSelections([]);
      onOpenChange(false);
    }
  };

  // 取消
  const handleCancel = () => {
    setSelections([]);
    onOpenChange(false);
  };

  // 统计
  const selectedCount = selections.length;
  const selectedWeight = useMemo(() => {
    return selections.reduce((sum, item) => {
      const cargo = getCargoInfo(item.cargoId)?.cargo;
      return sum + (cargo?.grossWeight || 0) * item.quantity;
    }, 0);
  }, [selections]);

  // 对话框关闭时重置
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelections([]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            添加货物
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* 可添加货物数量提示 */}
          <div className="text-xs text-gray-500 mb-4">
            可添加 {availableCargos.length} 种货物，已选择 {selectedCount} 种
          </div>

          {/* 选择列表 */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {selections.length === 0 && (
              <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">点击下方按钮添加货物</p>
              </div>
            )}
            
            {selections.map((item, index) => {
              const cargoInfo = getCargoInfo(item.cargoId);
              if (!cargoInfo) return null;
              const cargo = cargoInfo.cargo;
              
              return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  {/* 第一行：选择和数量 */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* 货物下拉选择 */}
                    <div className="flex-1 min-w-0">
                      <Select
                        value={item.cargoId}
                        onValueChange={(value) => updateCargoId(index, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCargos
                            .filter(cr => cr.cargo.id === item.cargoId || !selectedCargoIds.has(cr.cargo.id))
                            .map((cr) => (
                              <SelectItem key={cr.cargo.id} value={cr.cargo.id}>
                                <span className="text-xs text-gray-500">[{cr.cargo.serialNumber}]</span>{' '}
                                <span className="truncate">{cr.cargo.name}</span>{' '}
                                <span className="text-xs text-gray-400">(剩{cr.remaining}件)</span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 数量输入 */}
                    <div className="flex items-center gap-1 w-28">
                      <Label className="text-xs text-gray-500 whitespace-nowrap">数量:</Label>
                      <Input
                        type="number"
                        min={1}
                        max={cargoInfo.remaining}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                        className="w-14 h-8 text-sm text-center"
                      />
                    </div>

                    {/* 删除按钮 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => removeSelectionRow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* 第二行：货物详细信息 */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 pl-1">
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      尺寸: {cargo.length}×{cargo.width}×{cargo.height}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      单件毛重: {cargo.grossWeight.toFixed(2)}t
                    </span>
                    <span className="flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      总重: {(cargo.grossWeight * item.quantity).toFixed(2)}t
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 添加按钮 */}
          {availableCargos.length > selectedCargoIds.size && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={addSelectionRow}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加货物
            </Button>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              已选: <span className="font-semibold">{selectedCount}</span> 种
            </span>
            <span className="text-gray-600 flex items-center gap-1">
              <Weight className="h-4 w-4" />
              <span className="font-semibold">{selectedWeight.toFixed(2)}</span> t
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selectedCount === 0}
            >
              确认添加
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
