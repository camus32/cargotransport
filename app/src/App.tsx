import { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { useCargoState } from '@/hooks/useCargoState';
import { cargoData as defaultCargoData } from '@/data/cargoData';
import { CargoList } from '@/components/CargoList';
import { VehicleCard } from '@/components/VehicleCard';
import { AddCargoDialog } from '@/components/AddCargoDialog';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { ExcelImporter } from '@/components/ExcelImporter';
import { ExportButton } from '@/components/ExportButton';
import type { Cargo } from '@/types';
import './App.css';

function App() {
  const [cargoData, setCargoData] = useState<Cargo[]>(defaultCargoData);
  const [hasImported, setHasImported] = useState(false);
  
  const {
    vehicles,
    cargoRemainings,
    vehicleStats,
    globalStats,
    addVehicle,
    removeVehicle,
    updateVehicleName,
    updateVehicle,
    addCargoToVehicle,
    removeCargoFromVehicle,
    updateVehicleCargoQuantity,
    resetVehicles,
    addCargo
  } = useCargoState(cargoData);

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [isAddCargoOpen, setIsAddCargoOpen] = useState(false);

  // 处理导入Excel
  const handleImport = (cargos: Cargo[]) => {
    setCargoData(cargos);
    setHasImported(true);
    // 导入新数据时清空车辆分配
    resetVehicles();
  };

  // 重置为默认数据
  const handleReset = () => {
    setCargoData(defaultCargoData);
    setHasImported(false);
    resetVehicles();
  };

  // 处理添加车辆
  const handleAddVehicle = () => {
    if (newVehicleName.trim()) {
      addVehicle(newVehicleName.trim());
      setNewVehicleName('');
      setIsAddVehicleOpen(false);
    }
  };

  // 处理打开添加货物对话框
  const handleOpenAddCargo = (vehicleId: string) => {
    setActiveVehicleId(vehicleId);
    setIsAddCargoOpen(true);
  };

  // 处理确认添加货物
  const handleConfirmAddCargo = (selections: { cargoId: string; quantity: number }[]) => {
    if (activeVehicleId) {
      selections.forEach(({ cargoId, quantity }) => {
        addCargoToVehicle(activeVehicleId, cargoId, quantity);
      });
    }
    setActiveVehicleId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 页面头部 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-gray-800" />
          <h1 className="text-xl font-semibold text-gray-900">货物运输分配工具</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Excel导入 */}
          <ExcelImporter onImport={handleImport} />
          
          {hasImported && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              恢复默认数据
            </Button>
          )}
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>车辆数: <span className="font-semibold text-gray-900">{vehicles.length}</span></span>
            <span>货物种类: <span className="font-semibold text-gray-900">{globalStats.totalCargoTypes}</span></span>
            <span>完成进度: <span className="font-semibold text-green-700">{globalStats.progressPercent}%</span></span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧货物清单 */}
        <div className="w-[400px] flex-shrink-0 h-full overflow-hidden">
          <CargoList cargoRemainings={cargoRemainings} onAddCargo={addCargo} />
        </div>

        {/* 右侧车辆管理区 */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* 标题栏 - 固定 */}
          <div className="p-6 pb-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              车辆分配 ({vehicles.length})
            </h2>
            <div className="flex items-center gap-2">
              <ExportButton vehicles={vehicles} cargos={cargoData} />
              <Button onClick={() => setIsAddVehicleOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                添加车辆
              </Button>
            </div>
          </div>

          {/* 车辆列表 - 可滚动 */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {vehicles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无车辆</h3>
                <p className="text-sm text-gray-500 mb-4">点击上方按钮添加第一辆车</p>
                <Button onClick={() => setIsAddVehicleOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加车辆
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicleStats.map((stats) => (
                  <VehicleCard
                    key={stats.vehicle.id}
                    vehicle={stats.vehicle}
                    cargoRemainings={cargoRemainings}
                    totalWeight={stats.totalWeight}
                    cargoCount={stats.cargoCount}
                    onRemove={() => removeVehicle(stats.vehicle.id)}
                    onUpdateName={(name) => updateVehicleName(stats.vehicle.id, name)}
                    onUpdateVehicle={(updates) => updateVehicle(stats.vehicle.id, updates)}
                    onAddCargo={() => handleOpenAddCargo(stats.vehicle.id)}
                    onRemoveCargo={(cargoId) => removeCargoFromVehicle(stats.vehicle.id, cargoId)}
                    onUpdateQuantity={(cargoId, quantity) => 
                      updateVehicleCargoQuantity(stats.vehicle.id, cargoId, quantity)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* 底部统计面板 */}
          <StatisticsPanel stats={globalStats} />
        </div>
      </div>

      {/* 添加车辆对话框 */}
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>添加车辆</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              车辆名称
            </label>
            <Input
              value={newVehicleName}
              onChange={(e) => setNewVehicleName(e.target.value)}
              placeholder="例如：运输车1号"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddVehicle();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddVehicle} disabled={!newVehicleName.trim()}>
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加货物对话框 */}
      <AddCargoDialog
        open={isAddCargoOpen}
        onOpenChange={setIsAddCargoOpen}
        cargoRemainings={cargoRemainings}
        onConfirm={handleConfirmAddCargo}
      />
    </div>
  );
}

export default App;
