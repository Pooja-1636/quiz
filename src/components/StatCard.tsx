import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = 'bg-primary' }) => {
  return (
    <div className="card p-6 flex items-start justify-between group hover:border-primary/20 transition-all">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {trend && (
          <p className={cn(
            "text-xs mt-2 font-medium flex items-center gap-1",
            trend.isPositive ? "text-emerald-600" : "text-red-600"
          )}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            {trend.value}% from last month
          </p>
        )}
      </div>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
        color
      )}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
