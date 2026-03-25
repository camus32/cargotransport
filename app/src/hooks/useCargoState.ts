import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Cargo, Vehicle, CargoRemaining, VehicleStats, GlobalStats } from '@/types';

export function useCargoState(initialCargos: Cargo[]) {
  const [cargos, setCargos] = useState<Cargo[]>(initialCargos);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // 当初始数据变化时更新cargos
  useEffect(() => {
    setCargos(initialCargos);
  }, [initialCargos]);

  // 计算货物的剩余数量
  const getRemainingQuantity = useCallback((cargo: Cargo): number => {
    const allocated = vehicles.reduce((sum, vehicle) => {
      const vc = vehicle.cargos.find(vc => vc.cargoId === cargo.id);
      return sum + (vc?.quantity || 0);
    }, 0);
    return cargo.totalQuantity - allocated;
  }, [vehicles]);

  // 计算货物已分配数量
  const getAllocatedQuantity = useCallback((cargo: Cargo): number => {
    return vehicles.reduce((sum, vehicle) => {
      const vc = vehicle.cargos.find(vc => vc.cargoId === cargo.id);
      return sum + (vc?.quantity || 0);
    }, 0);
  }, [vehicles]);

  // 货物剩余信息列表
  const cargoRemainings = useMemo<CargoRemaining[]>(() => {
    return cargos.map(cargo => ({
      cargo,
      remaining: getRemainingQuantity(cargo),
      allocated: getAllocatedQuantity(cargo)
    }));
  }, [cargos, getRemainingQuantity, getAllocatedQuantity]);

  // 计算车辆总重量
  const getVehicleTotalWeight = useCallback((vehicle: Vehicle): number => {
    return vehicle.cargos.reduce((sum, vc) => {
      const cargo = cargos.find(c => c.id === vc.cargoId);
      return sum + (cargo?.grossWeight || 0) * vc.quantity;
    }, 0);
  }, [cargos]);

  // 计算车辆货物件数
  const getVehicleTotalQuantity = useCallback((vehicle: Vehicle): number => {
    return vehicle.cargos.reduce((sum, vc) => sum + vc.quantity, 0);
  }, []);

  // 车辆统计信息
  const vehicleStats = useMemo<VehicleStats[]>(() => {
    return vehicles.map(vehicle => ({
      vehicle,
      totalWeight: getVehicleTotalWeight(vehicle),
      totalQuantity: getVehicleTotalQuantity(vehicle),
      cargoCount: vehicle.cargos.length
    }));
  }, [vehicles, getVehicleTotalWeight, getVehicleTotalQuantity]);

  // 全局统计信息
  const globalStats = useMemo<GlobalStats>(() => {
    const totalCargoTypes = cargos.length;
    const totalPieces = cargos.reduce((sum, c) => sum + c.totalQuantity, 0);
    const totalWeight = cargos.reduce((sum, c) => sum + c.totalWeight, 0);

    const allocatedTypes = new Set(vehicles.flatMap(v => v.cargos.map(vc => vc.cargoId))).size;
    const allocatedPieces = vehicles.reduce((sum, v) => sum + v.cargos.reduce((s, vc) => s + vc.quantity, 0), 0);
    const allocatedWeight = vehicles.reduce((sum, v) => sum + getVehicleTotalWeight(v), 0);

    const remainingTypes = cargoRemainings.filter(cr => cr.remaining > 0).length;
    const remainingPieces = cargoRemainings.reduce((sum, cr) => sum + cr.remaining, 0);
    const remainingWeight = totalWeight - allocatedWeight;

    const progressPercent = totalPieces > 0 ? Math.round((allocatedPieces / totalPieces) * 100) : 0;

    return {
      totalCargoTypes,
      totalPieces,
      totalWeight,
      allocatedTypes,
      allocatedPieces,
      allocatedWeight,
      remainingTypes,
      remainingPieces,
      remainingWeight,
      progressPercent
    };
  }, [cargos, vehicles, cargoRemainings, getVehicleTotalWeight]);

  // 添加车辆
  const addVehicle = useCallback((name: string) => {
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      name,
      cargos: []
    };
    setVehicles(prev => [...prev, newVehicle]);
  }, []);

  // 删除车辆
  const removeVehicle = useCallback((vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
  }, []);

  // 更新车辆名称
  const updateVehicleName = useCallback((vehicleId: string, name: string) => {
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, name } : v
    ));
  }, []);

  // 更新车辆属性
  const updateVehicle = useCallback((vehicleId: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, ...updates } : v
    ));
  }, []);

  // 为车辆添加货物
  const addCargoToVehicle = useCallback((vehicleId: string, cargoId: string, quantity: number) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      
      const existingIndex = v.cargos.findIndex(vc => vc.cargoId === cargoId);
      if (existingIndex >= 0) {
        // 更新现有货物数量
        const newCargos = [...v.cargos];
        newCargos[existingIndex] = {
          ...newCargos[existingIndex],
          quantity: newCargos[existingIndex].quantity + quantity
        };
        return { ...v, cargos: newCargos };
      } else {
        // 添加新货物
        return { ...v, cargos: [...v.cargos, { cargoId, quantity }] };
      }
    }));
  }, []);

  // 从车辆移除货物
  const removeCargoFromVehicle = useCallback((vehicleId: string, cargoId: string) => {
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId 
        ? { ...v, cargos: v.cargos.filter(vc => vc.cargoId !== cargoId) }
        : v
    ));
  }, []);

  // 更新车辆货物数量
  const updateVehicleCargoQuantity = useCallback((vehicleId: string, cargoId: string, quantity: number) => {
    if (quantity <= 0) {
      removeCargoFromVehicle(vehicleId, cargoId);
      return;
    }
    
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      return {
        ...v,
        cargos: v.cargos.map(vc => 
          vc.cargoId === cargoId ? { ...vc, quantity } : vc
        )
      };
    }));
  }, [removeCargoFromVehicle]);

  // 重置所有车辆
  const resetVehicles = useCallback(() => {
    setVehicles([]);
  }, []);

  // 添加手动货物
  const addCargo = useCallback((cargo: Cargo) => {
    setCargos(prev => [...prev, cargo]);
  }, []);

  // 删除货物
  const removeCargo = useCallback((cargoId: string) => {
    setCargos(prev => prev.filter(c => c.id !== cargoId));
    // 同时从所有车辆中移除该货物
    setVehicles(prev => prev.map(v => ({
      ...v,
      cargos: v.cargos.filter(vc => vc.cargoId !== cargoId)
    })));
  }, []);

  return {
    cargos,
    vehicles,
    cargoRemainings,
    vehicleStats,
    globalStats,
    getRemainingQuantity,
    getAllocatedQuantity,
    getVehicleTotalWeight,
    addVehicle,
    removeVehicle,
    updateVehicleName,
    updateVehicle,
    addCargoToVehicle,
    removeCargoFromVehicle,
    updateVehicleCargoQuantity,
    resetVehicles,
    addCargo,
    removeCargo
  };
}
