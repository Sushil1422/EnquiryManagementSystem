import React from "react";

interface DashboardCardProps {
  title: string;
  count: string | number;
  buttonColor: string;
  buttonIconUrl: string;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  count,
  buttonColor,
  buttonIconUrl,
  onClick,
}) => {
  return (
    <div className="flex justify-between items-start bg-white w-[228px] p-6 rounded-lg">
      <div className="flex flex-col items-start w-[78px] gap-[9px]">
        <span className="text-gray-500 text-[11px]">{title}</span>
        <span className="text-black text-[25px] font-bold">{count}</span>
      </div>
      <button
        className={`flex flex-col items-center ${buttonColor} text-left w-12 py-3 rounded-[9999px] border-0`}
        onClick={onClick}
      >
        <img
          src={buttonIconUrl}
          className="w-6 h-6 rounded-[9999px] object-fill"
        />
      </button>
    </div>
  );
};

export default DashboardCard;
