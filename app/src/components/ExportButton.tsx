import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Vehicle, Cargo } from '@/types';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  vehicles: Vehicle[];
  cargos: Cargo[];
}

export function ExportButton({ vehicles, cargos }: ExportButtonProps) {
  const handleExport = () => {
    if (vehicles.length === 0) {
      alert('暂无车辆数据可导出');
      return;
    }

    // 准备导出数据
    const exportData: any[] = [];
    
    vehicles.forEach((vehicle, vehicleIndex) => {
      // 车辆基本信息
      const vehicleInfo = {
        '序号': vehicleIndex + 1,
        '车辆名称': vehicle.name,
        '车型': vehicle.vehicleType || '-',
        '占长(m)': vehicle.occupiedLength || '-',
        '占宽(m)': vehicle.occupiedWidth || '-',
        '重量(t)': vehicle.weight || '-',
        '运费(元)': vehicle.freightCost || '-',
        '货物序号': '',
        '货物名称': '',
        '货物编号': '',
        '数量(件)': '',
        '长度(m)': '',
        '宽度(m)': '',
        '高度(m)': '',
        '单件毛重(t)': '',
        '货物总重(t)': '',
        '货物备注': ''
      };

      if (vehicle.cargos.length === 0) {
        // 车辆无货物
        exportData.push({
          ...vehicleInfo,
          '货物名称': '(无货物)'
        });
      } else {
        // 车辆有货物，每行一个货物
        vehicle.cargos.forEach((vc) => {
          const cargo = cargos.find(c => c.id === vc.cargoId);
          if (cargo) {
            exportData.push({
              ...vehicleInfo,
              '货物序号': cargo.serialNumber,
              '货物名称': cargo.name,
              '货物编号': cargo.id,
              '数量(件)': vc.quantity,
              '长度(m)': cargo.length,
              '宽度(m)': cargo.width,
              '高度(m)': cargo.height,
              '单件毛重(t)': cargo.grossWeight,
              '货物总重(t)': (cargo.grossWeight * vc.quantity).toFixed(2),
              '货物备注': cargo.remark || '-'
            });
          }
        });
      }
    });

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 设置列宽
    const colWidths = [
      { wch: 6 },   // 序号
      { wch: 15 },  // 车辆名称
      { wch: 12 },  // 车型
      { wch: 10 },  // 占长
      { wch: 10 },  // 占宽
      { wch: 10 },  // 重量
      { wch: 12 },  // 运费
      { wch: 8 },   // 货物序号
      { wch: 30 },  // 货物名称
      { wch: 20 },  // 货物编号
      { wch: 10 },  // 数量
      { wch: 10 },  // 长度
      { wch: 10 },  // 宽度
      { wch: 10 },  // 高度
      { wch: 12 },  // 单件毛重
      { wch: 12 },  // 货物总重
      { wch: 20 }   // 货物备注
    ];
    ws['!cols'] = colWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '车辆分配表');

    // 生成文件名
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const fileName = `车辆分配表_${dateStr}.xlsx`;

    // 下载文件
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      disabled={vehicles.length === 0}
    >
      <Download className="h-4 w-4 mr-1" />
      导出Excel
    </Button>
  );
}
