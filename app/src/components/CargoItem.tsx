import { useState } from 'react';
import type { CargoRemaining } from '@/types';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronDown, ChevronUp, Ruler, Weight, Package, MapPin, FileText } from 'lucide-react';

interface CargoItemProps {
  cargoRemaining: CargoRemaining;
}

export function CargoItem({ cargoRemaining }: CargoItemProps) {
  const { cargo, remaining, allocated } = cargoRemaining;
  const [isExpanded, setIsExpanded] = useState(false);
  
  const progress = cargo.totalQuantity > 0 
    ? Math.round((allocated / cargo.totalQuantity) * 100) 
    : 0;
  const isComplete = remaining === 0;

  return (
    <div className={`rounded-lg border ${
      isComplete 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-gray-200'
    }`}>
      {/* 头部信息 */}
      <div 
        className="p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <table className="w-full">
          <tbody>
            <tr>
              {/* 左侧内容区 */}
              <td className="align-top">
                {/* 序号和名称 */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    {cargo.serialNumber}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {cargo.name}
                  </span>
                  {isComplete && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </div>
                
                {/* 毛重和尺寸 */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span>毛重: <b>{cargo.grossWeight.toFixed(2)}t</b></span>
                  <span>尺寸: {cargo.length}×{cargo.width}×{cargo.height}m</span>
                </div>
                
                {/* 进度条 */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={isComplete ? 'text-green-700' : 'text-gray-600'}>
                      剩余: <b>{remaining}</b> / {cargo.totalQuantity} 件
                    </span>
                    <span className={isComplete ? 'text-green-700' : 'text-gray-500'}>
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              </td>
              
              {/* 右侧箭头 - 固定宽度 */}
              <td className="align-middle w-10 text-right">
                <div 
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
                    isExpanded 
                      ? 'bg-gray-200 border-gray-300 text-gray-700' 
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 展开详情 */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-200">
          <div className="pt-3 space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <Package className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">总编号: {cargo.id}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Ruler className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">部位: {cargo.category || '-'}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Weight className="h-3 w-3 flex-shrink-0" />
                <span>净重: {cargo.netWeight.toFixed(2)}t</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Weight className="h-3 w-3 flex-shrink-0" />
                <span>总重量: {cargo.totalWeight.toFixed(2)}t</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">所在地: {cargo.location || '-'}</span>
              </div>
            </div>
            {cargo.remark && (
              <div className="flex items-start gap-1 text-xs text-gray-600">
                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>备注: {cargo.remark}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
