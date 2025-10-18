import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType; // React Icon component
  iconBgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
}) => (
  <div className="flex items-center p-4 bg-white rounded-lg shadow">
    <div className={`p-3 rounded-full ${iconBgColor}`}>
      <Icon className="text-white w-6 h-6" />
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);

export default StatCard;
