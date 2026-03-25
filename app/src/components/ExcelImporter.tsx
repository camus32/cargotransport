import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import type { Cargo } from '@/types';

interface ExcelImporterProps {
  onImport: (cargos: Cargo[]) => void;
}

export function ExcelImporter({ onImport }: ExcelImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const parseExcel = (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          setIsProcessing(false);
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        // 查找表头行
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(jsonData.length, 5); i++) {
          const row = jsonData[i];
          if (row && row.some(cell => 
            String(cell).includes('序号') || 
            String(cell).includes('名称') || 
            String(cell).includes('编号')
          )) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          setIsProcessing(false);
          alert('无法识别表格结构，请确保包含"序号"、"名称"或"编号"列');
          return;
        }

        const headers = jsonData[headerRowIndex].map(h => String(h).trim());
        
        // 查找列索引
        const findColumnIndex = (keywords: string[]): number => {
          for (const keyword of keywords) {
            const idx = headers.findIndex(h => h.includes(keyword));
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const serialCol = findColumnIndex(['序号']);
        const nameCol = findColumnIndex(['名称']);
        const idCol = findColumnIndex(['总编号', '编号']);
        const categoryCol = findColumnIndex(['部位']);
        const quantityCol = findColumnIndex(['数量', '件数']);
        const lengthCol = findColumnIndex(['长度', 'Length']);
        const widthCol = findColumnIndex(['宽度', 'Width']);
        const heightCol = findColumnIndex(['高度', 'height']);
        const netWeightCol = findColumnIndex(['净重', 'Net weight']);
        const grossWeightCol = findColumnIndex(['毛重', 'Gross weight']);
        const totalWeightCol = findColumnIndex(['总重量', 'Total weight']);
        const remarkCol = findColumnIndex(['备注', 'Remarks']);
        const locationCol = findColumnIndex(['所在地', 'Location']);

        const cargos: Cargo[] = [];
        let successCount = 0;
        let failedCount = 0;

        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const serialNumber = serialCol !== -1 ? parseFloat(row[serialCol]) : i - headerRowIndex;
          
          if (isNaN(serialNumber) || serialNumber <= 0) {
            failedCount++;
            continue;
          }

          const name = nameCol !== -1 ? String(row[nameCol] || '') : '';
          if (!name || name === 'nan' || name === 'undefined') {
            failedCount++;
            continue;
          }

          const parseNum = (val: any): number => {
            if (val === undefined || val === null || val === '') return 0;
            const num = parseFloat(String(val));
            return isNaN(num) ? 0 : num;
          };

          const totalQuantity = quantityCol !== -1 ? parseNum(row[quantityCol]) : 1;
          
          const cargo: Cargo = {
            id: idCol !== -1 && row[idCol] ? String(row[idCol]) : `CARGO-${Math.floor(serialNumber)}`,
            serialNumber: Math.floor(serialNumber),
            name: name,
            category: categoryCol !== -1 ? String(row[categoryCol] || '') : '',
            totalQuantity: totalQuantity || 1,
            length: lengthCol !== -1 ? parseNum(row[lengthCol]) : 0,
            width: widthCol !== -1 ? parseNum(row[widthCol]) : 0,
            height: heightCol !== -1 ? parseNum(row[heightCol]) : 0,
            netWeight: netWeightCol !== -1 ? parseNum(row[netWeightCol]) : 0,
            grossWeight: grossWeightCol !== -1 ? parseNum(row[grossWeightCol]) : 0,
            totalWeight: totalWeightCol !== -1 ? parseNum(row[totalWeightCol]) : 0,
            remark: remarkCol !== -1 ? String(row[remarkCol] || '') : '',
            location: locationCol !== -1 ? String(row[locationCol] || '') : ''
          };

          // 如果没有总重量，计算一下
          if (cargo.totalWeight === 0 && cargo.grossWeight > 0) {
            cargo.totalWeight = cargo.grossWeight * cargo.totalQuantity;
          }

          cargos.push(cargo);
          successCount++;
        }

        setIsProcessing(false);
        setImportResult({ success: successCount, failed: failedCount });

        if (cargos.length > 0) {
          onImport(cargos);
          // 3秒后清除结果提示
          setTimeout(() => {
            setImportResult(null);
            setFileName(null);
          }, 3000);
        } else {
          alert('未能从文件中解析出有效数据，请检查文件格式');
        }
      } catch (error) {
        console.error('解析Excel失败:', error);
        setIsProcessing(false);
        alert('文件解析失败，请检查文件格式');
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      alert('文件读取失败');
    };

    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parseExcel(file);
      } else {
        alert('请上传Excel文件 (.xlsx 或 .xls)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseExcel(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setFileName(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {!fileName ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-all
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-white'
            }
          `}
        >
          <Upload className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {isDragging ? '松开以上传' : '点击或拖拽上传Excel'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200">
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full" />
              <span className="text-sm text-green-700">正在处理...</span>
            </>
          ) : importResult ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                成功导入 {importResult.success} 条
                {importResult.failed > 0 && `，失败 ${importResult.failed} 条`}
              </span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 truncate max-w-[150px]">{fileName}</span>
            </>
          )}
          {!isProcessing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-1"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
