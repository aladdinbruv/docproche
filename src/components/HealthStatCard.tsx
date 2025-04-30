import React, { useState, useEffect } from 'react';
import { Pill, FileText, ShieldCheck, Activity } from 'lucide-react';

interface HealthStatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: string;
  trend?: 'positive' | 'negative' | 'neutral';
  animationDelay?: number;
}

export const HealthStatCard: React.FC<HealthStatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  trend = 'neutral',
  animationDelay = 0 
}) => {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);
  
  useEffect(() => {
    if (!visible || typeof value !== 'number') return;
    
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16); // Update every ~16ms for 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, visible]);
  
  const renderValue = () => {
    if (typeof value === 'string') {
      return value;
    }
    return count.toLocaleString();
  };
  
  // Get the appropriate icon component
  const renderIcon = () => {
    switch(icon) {
      case 'pills':
        return <Pill className="w-5 h-5" />;
      case 'file-medical':
        return <FileText className="w-5 h-5" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };
  
  // Get color based on trend
  const getTrendColor = () => {
    switch (trend) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };
  
  return (
    <div 
      className={`
        opacity-0 translate-y-4
        ${visible ? 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500' : ''}
        bg-white rounded-lg shadow-md p-6 border border-neutral-100
      `}
      style={{ 
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards' 
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-neutral-700">{title}</h3>
          <div className={`p-2 rounded-full ${getTrendColor()} bg-opacity-10`}>
            {renderIcon()}
          </div>
        </div>
        <div className="text-2xl font-bold text-neutral-800 mb-1">
          {renderValue()}
        </div>
        <div className="text-neutral-500 text-sm">{subtitle}</div>
      </div>
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  maxValue: number;
  title: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  value, 
  maxValue, 
  title, 
  color = 'primary',
  size = 96,
  strokeWidth = 8
}) => {
  const [progress, setProgress] = useState(0);
  const percentage = (value / maxValue) * 100;
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative`} style={{ width: size, height: size }}>
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle 
            className="text-neutral-200" 
            cx={size/2} 
            cy={size/2} 
            r={radius} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={strokeWidth}
          />
          {/* Progress circle with transition */}
          <circle 
            className={`text-${color} transition-all duration-1000 ease-out`}
            cx={size/2} 
            cy={size/2} 
            r={radius} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold">{value}</span>
          <span className="text-xs text-neutral-500">/ {maxValue}</span>
        </div>
      </div>
      <p className="mt-2 text-center font-medium">{title}</p>
    </div>
  );
}; 