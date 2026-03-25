import { useState } from 'react';
import type { Vehicle, CargoRemaining } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  Plus, 
  Trash2, 
  Weight,
  Package,
  Minus,
  Edit2,
  DollarSign,
  Ruler
} from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  cargoRemainings: CargoRemaining[];
  totalWeight: number;
  cargoCount: number;
  onRemove: () => void;
  onUpdateName: (name: string) => void;
  onUpdateVehicle: (updates: Partial<Vehicle>) => void;
  onAddCargo: () => void;
  onRemoveCargo: (cargoId: string) => void;
  onUpdateQuantity: (cargoId: string, quantity: number) => void;
}

export function VehicleCard({
  vehicle,
  cargoRemainings,
  totalWeight,
  cargoCount,
  onRemove,
  onUpdateName,
  onUpdateVehicle,
  onAddCargo,
  onRemoveCargo,
  onUpdateQuantity
}: VehicleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(vehicle.name);
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateName(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditName(vehicle.name);
      setIsEditing(false);
    }
  };

  // 获取货物信息
  const getCargoInfo = (cargoId: string) => {
    return cargoRemainings.find(cr => cr.cargo.id === cargoId)?.cargo;
  };

  // 获取货物剩余数量（加上当前车辆已分配的）
  const getMaxQuantity = (cargoId: string, currentQuantity: number) => {
    const remaining = cargoRemainings.find(cr => cr.cargo.id === cargoId)?.remaining || 0;
    return remaining + currentQuantity;
  };

  // 处理车辆属性更新
  const handleUpdateField = (field: keyof Vehicle, value: string | number) => {
    onUpdateVehicle({ [field]: value });
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      {/* 卡片头部 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Truck className="h-5 w-5 text-gray-600" />
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                className="h-8 w-48"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                <button
                  className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {cargoCount} 种
              </span>
              <span className="flex items-center gap-1">
                <Weight className="h-4 w-4" />
                {totalWeight.toFixed(2)} t
              </span>
            </div>
            
            <button
              className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            
            <button
              className="h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 展开内容 */}
      {isExpanded && (
        <CardContent className="p-4">
          {/* 车辆信息输入区 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowVehicleInfo(!showVehicleInfo)}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Ruler className="h-4 w-4" />
                车辆信息
                {(vehicle.vehicleType || vehicle.occupiedLength || vehicle.occupiedWidth || vehicle.weight || vehicle.freightCost) && (
                  <span className="text-xs text-green-600">(已填写)</span>
                )}
              </div>
              <div className="text-gray-500">
                {showVehicleInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
            
            {showVehicleInfo && (
              <div className="mt-3 grid grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">车型</Label>
                  <Input
                    value={vehicle.vehicleType || ''}
                    onChange={(e) => handleUpdateField('vehicleType', e.target.value)}
                    placeholder="如：平板车"
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">占长(m)</Label>
                  <Input
                    type="number"
                    value={vehicle.occupiedLength || ''}
                    onChange={(e) => handleUpdateField('occupiedLength', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">占宽(m)</Label>
                  <Input
                    type="number"
                    value={vehicle.occupiedWidth || ''}
                    onChange={(e) => handleUpdateField('occupiedWidth', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">重量(t)</Label>
                  <Input
                    type="number"
                    value={vehicle.weight || ''}
                    onChange={(e) => handleUpdateField('weight', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    运费(元)
                  </Label>
                  <Input
                    type="number"
                    value={vehicle.freightCost || ''}
                    onChange={(e) => handleUpdateField('freightCost', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-8 text-sm mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {vehicle.cargos.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <Truck className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-4">该车辆暂无货物</p>
              <Button onClick={onAddCargo} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                添加货物
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">序号</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead className="w-24">数量</TableHead>
                    <TableHead className="w-24">毛重(t)</TableHead>
                    <TableHead className="w-16">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicle.cargos.map((vc) => {
                    const cargo = getCargoInfo(vc.cargoId);
                    if (!cargo) return null;
                    
                    const maxQty = getMaxQuantity(vc.cargoId, vc.quantity);
                    
                    return (
                      <TableRow key={vc.cargoId}>
                        <TableCell className="font-medium">{cargo.serialNumber}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={cargo.name}>
                          {cargo.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => onUpdateQuantity(vc.cargoId, vc.quantity - 1)}
                              disabled={vc.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              max={maxQty}
                              value={vc.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                onUpdateQuantity(vc.cargoId, Math.min(val, maxQty));
                              }}
                              className="w-14 h-7 text-center text-sm px-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => onUpdateQuantity(vc.cargoId, vc.quantity + 1)}
                              disabled={vc.quantity >= maxQty}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(cargo.grossWeight * vc.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => onRemoveCargo(vc.cargoId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-center">
                <Button onClick={onAddCargo} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  继续添加货物
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
