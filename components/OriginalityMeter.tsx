
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Text } from 'recharts';

interface OriginalityMeterProps {
  score: number;
}

const OriginalityMeter: React.FC<OriginalityMeterProps> = ({ score }) => {
  const data = [
    { name: 'Plagiarized', value: score },
    { name: 'Original', value: 100 - score },
  ];

  const COLORS = ['#ef4444', '#10b981']; // Red for plagiarized, Green for original

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            startAngle={180}
            endAngle={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
        <span className="text-4xl font-bold text-gray-800">{100 - score}%</span>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Originality</span>
      </div>
    </div>
  );
};

export default OriginalityMeter;
