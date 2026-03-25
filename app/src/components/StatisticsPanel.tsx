import type { GlobalStats } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Package, Weight, CheckCircle2, Layers } from 'lucide-react';

interface StatisticsPanelProps {
  stats: GlobalStats;
}

export function StatisticsPanel({ stats }: StatisticsPanelProps) {
  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* 左侧 - 总计 */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              总种类: <span className="font-semibold text-gray-900">{stats.totalCargoTypes}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              总件数: <span className="font-semibold text-gray-900">{stats.totalPieces}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              总重量: <span className="font-semibold text-gray-900">{stats.totalWeight.toFixed(2)} t</span>
            </span>
          </div>
        </div>

        {/* 中间 - 进度 */}
        <div className="flex items-center gap-4 flex-1 mx-8 max-w-md">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">分配进度</span>
              <span className="font-medium text-gray-900">{stats.progressPercent}%</span>
            </div>
            <Progress value={stats.progressPercent} className="h-2" />
          </div>
        </div>

        {/* 右侧 - 已分配/剩余 */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">
              已分配: 
              <span className="font-semibold text-green-700 ml-1">
                {stats.allocatedTypes}/{stats.totalCargoTypes} 种
              </span>
              <span className="font-semibold text-green-700 ml-1">
                {stats.allocatedPieces} 件
              </span>
              <span className="font-semibold text-green-700 ml-1">
                {stats.allocatedWeight.toFixed(2)} t
              </span>
            </span>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">
              剩余: 
              <span className="font-semibold text-blue-700 ml-1">
                {stats.remainingTypes} 种
              </span>
              <span className="font-semibold text-blue-700 ml-1">
                {stats.remainingPieces} 件
              </span>
              <span className="font-semibold text-blue-700 ml-1">
                {stats.remainingWeight.toFixed(2)} t
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
