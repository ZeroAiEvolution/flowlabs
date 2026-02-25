import { ReactNode } from 'react';

interface TechCardProps {
  name: string;
  icon: ReactNode;
  color: string;
  glowColor: string;
}

const TechCard = ({ name, icon, color, glowColor }: TechCardProps) => {
  return (
    <div
      className="tech-card bg-card border border-border rounded-2xl p-4 aspect-square flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all duration-200"
      style={{
        '--hover-border-color': color,
        '--hover-glow': glowColor,
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.borderColor = color;
        target.style.boxShadow = `0 8px 30px ${glowColor}`;
        target.style.transform = 'translateY(-8px) scale(1.02)';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.borderColor = '';
        target.style.boxShadow = '';
        target.style.transform = '';
      }}
    >
      <div className="w-10 h-10 flex items-center justify-center">
        {icon}
      </div>
      <span className="font-medium text-xs">{name}</span>
    </div>
  );
};

export default TechCard;
