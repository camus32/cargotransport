import { useState } from 'react';
import type { Cargo } from '@/types';
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
import { Package, Plus } from 'lucide-react';

interface AddManualCargoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cargo: Cargo) => void;
  existingCount: number;
}

export function AddManualCargoDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  existingCount
}: AddManualCargoDialogProps) {
  const [formData, setFormData] = useState<Partial<Cargo>>({
    name: '',
    totalQuantity: 1,
    length: 0,
    width: 0,
    height: 0,
    netWeight: 0,
    grossWeight: 0,
    totalWeight: 0,
    category: '',
    remark: '',
    location: '',
  });

  const handleChange = (field: keyof Cargo, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: keyof Cargo, value: string) => {
    const num = parseFloat(value) || 0;
    handleChange(field, num);
  };

  // 自动计算总重量
  const handleGrossWeightChange = (value: string) => {
    const grossWeight = parseFloat(value) || 0;
    const totalQuantity = formData.totalQuantity || 1;
    setFormData(prev => ({
      ...prev,
      grossWeight,
      totalWeight: grossWeight * totalQuantity
    }));
  };

  const handleQuantityChange = (value: string) => {
    const totalQuantity = parseInt(value) || 1;
    const grossWeight = formData.grossWeight || 0;
    setFormData(prev => ({
      ...prev,
      totalQuantity,
      totalWeight: grossWeight * totalQuantity
    }));
  };

  const handleConfirm = () => {
    if (!formData.name?.trim()) {
      alert('请输入货物名称');
      return;
    }

    const newCargo: Cargo = {
      id: `MANUAL-${Date.now()}`,
      serialNumber: existingCount + 1,
      name: formData.name.trim(),
      category: formData.category || '',
      totalQuantity: formData.totalQuantity || 1,
      length: formData.length || 0,
      width: formData.width || 0,
      height: formData.height || 0,
      netWeight: formData.netWeight || 0,
      grossWeight: formData.grossWeight || 0,
      totalWeight: formData.totalWeight || 0,
      remark: formData.remark || '',
      location: formData.location || '',
    };

    onConfirm(newCargo);
    
    // 重置表单
    setFormData({
      name: '',
      totalQuantity: 1,
      length: 0,
      width: 0,
      height: 0,
      netWeight: 0,
      grossWeight: 0,
      totalWeight: 0,
      category: '',
      remark: '',
      location: '',
    });
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            手动添加货物
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* 名称 */}
          <div>
            <Label className="text-sm text-gray-700">
              名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="请输入货物名称"
              className="mt-1"
            />
          </div>

          {/* 数量和重量 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-700">数量(件)</Label>
              <Input
                type="number"
                min={1}
                value={formData.totalQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700">部位/类别</Label>
              <Input
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="如：主机"
                className="mt-1"
              />
            </div>
          </div>

          {/* 尺寸 */}
          <div>
            <Label className="text-sm text-gray-700">尺寸 (m)</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.length}
                  onChange={(e) => handleNumberChange('length', e.target.value)}
                  placeholder="长"
                />
                <span className="text-xs text-gray-400 mt-0.5 block">长度</span>
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={(e) => handleNumberChange('width', e.target.value)}
                  placeholder="宽"
                />
                <span className="text-xs text-gray-400 mt-0.5 block">宽度</span>
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={(e) => handleNumberChange('height', e.target.value)}
                  placeholder="高"
                />
                <span className="text-xs text-gray-400 mt-0.5 block">高度</span>
              </div>
            </div>
          </div>

          {/* 重量 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-700">单件净重(t)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.netWeight}
                onChange={(e) => handleNumberChange('netWeight', e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700">单件毛重(t)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.grossWeight}
                onChange={(e) => handleGrossWeightChange(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          {/* 总重量 */}
          <div>
            <Label className="text-sm text-gray-700">总重量(t)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.totalWeight}
              onChange={(e) => handleNumberChange('totalWeight', e.target.value)}
              placeholder="自动计算"
              className="mt-1"
            />
            <span className="text-xs text-gray-400 mt-0.5 block">
              自动计算：单件毛重 × 数量
            </span>
          </div>

          {/* 所在地 */}
          <div>
            <Label className="text-sm text-gray-700">所在地</Label>
            <Input
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="请输入所在地"
              className="mt-1"
            />
          </div>

          {/* 备注 */}
          <div>
            <Label className="text-sm text-gray-700">备注</Label>
            <Input
              value={formData.remark}
              onChange={(e) => handleChange('remark', e.target.value)}
              placeholder="请输入备注信息"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!formData.name?.trim()}
          >
            <Package className="h-4 w-4 mr-1" />
            确认添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
