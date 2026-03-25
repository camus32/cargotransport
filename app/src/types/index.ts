// 货物数据类型
export interface Cargo {
  id: string;           // 总编号
  serialNumber: number; // 序号
  name: string;         // 名称
  category: string;     // 部位
  totalQuantity: number; // 总数量(件)
  length: number;       // 长度
  width: number;        // 宽度
  height: number;       // 高度
  netWeight: number;    // 单件净重
  grossWeight: number;  // 单件毛重
  totalWeight: number;  // 总重量
  remark: string;       // 备注
  location: string;     // 所在地
}

// 车辆货物分配
export interface VehicleCargo {
  cargoId: string;      // 货物ID
  quantity: number;     // 分配数量
}

// 车辆数据
export interface Vehicle {
  id: string;           // 车辆唯一ID
  name: string;         // 车辆名称
  vehicleType?: string; // 车型
  occupiedLength?: number; // 占长(m)
  occupiedWidth?: number;  // 占宽(m)
  weight?: number;      // 重量(t)
  freightCost?: number; // 车辆价格运费
  cargos: VehicleCargo[]; // 分配的货物列表
}

// 货物剩余信息
export interface CargoRemaining {
  cargo: Cargo;
  remaining: number;
  allocated: number;
}

// 车辆统计信息
export interface VehicleStats {
  vehicle: Vehicle;
  totalWeight: number;
  totalQuantity: number;
  cargoCount: number;
}

// 全局统计信息
export interface GlobalStats {
  totalCargoTypes: number;
  totalPieces: number;
  totalWeight: number;
  allocatedTypes: number;
  allocatedPieces: number;
  allocatedWeight: number;
  remainingTypes: number;
  remainingPieces: number;
  remainingWeight: number;
  progressPercent: number;
}
