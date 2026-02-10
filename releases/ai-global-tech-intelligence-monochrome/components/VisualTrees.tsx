
import React from 'react';

export const TechTree: React.FC = () => {
  return (
    <div className="relative w-full h-[300px] flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="absolute inset-0 pulse pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>
      <svg className="w-full h-full" viewBox="0 0 400 300">
        <path d="M200,280 L200,200 M200,200 L100,150 M200,200 L300,150 M100,150 L50,100 M100,150 L150,100 M300,150 L250,100 M300,150 L350,100" 
              stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="5,5" className="opacity-40" />
        
        <circle cx="200" cy="280" r="10" fill="#06b6d4" />
        <text x="215" y="285" fill="#06b6d4" className="text-[10px] font-bold">Base AI</text>
        
        <circle cx="200" cy="200" r="8" fill="#8b5cf6" />
        <text x="215" y="205" fill="#8b5cf6" className="text-[10px]">Deep Learning</text>

        {[
          {x: 100, y: 150, t: 'CV'}, {x: 300, y: 150, t: 'NLP'},
          {x: 50, y: 100, t: 'Segmentation'}, {x: 150, y: 100, t: 'Generative'},
          {x: 250, y: 100, t: 'LLM'}, {x: 350, y: 100, t: 'RLHF'}
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="6" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
            <text x={node.x} y={node.y - 12} textAnchor="middle" fill="#94a3b8" className="text-[8px]">{node.t}</text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 uppercase tracking-widest">Interactive Tech Phylogeny</div>
    </div>
  );
};

export const ScholarRelationshipTree: React.FC<{ scholarId: string }> = ({ scholarId }) => {
  return (
    <div className="relative w-full h-[400px] glass rounded-3xl overflow-hidden flex items-center justify-center">
      <div className="absolute top-4 left-6 text-cyan-400 text-sm font-bold uppercase tracking-widest">Collaborator Network</div>
      <svg className="w-full h-full" viewBox="0 0 500 400">
        <defs>
          <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{stopColor:'#06b6d4', stopOpacity:0.3}} />
            <stop offset="100%" style={{stopColor:'#06b6d4', stopOpacity:0}} />
          </radialGradient>
        </defs>
        
        {/* Connection Lines */}
        <g stroke="#ffffff10" strokeWidth="1">
          <line x1="250" y1="200" x2="150" y2="100" />
          <line x1="250" y1="200" x2="350" y2="100" />
          <line x1="250" y1="200" x2="150" y2="300" />
          <line x1="250" y1="200" x2="350" y2="300" />
          <line x1="150" y1="100" x2="350" y2="100" />
        </g>

        {/* Center Node */}
        <circle cx="250" cy="200" r="50" fill="url(#grad1)" />
        <circle cx="250" cy="200" r="20" fill="#06b6d4" className="animate-pulse" />
        <text x="250" y="240" textAnchor="middle" fill="#f8fafc" className="text-xs font-bold">Primary Target</text>

        {/* Peripheral Nodes */}
        {[
          {x: 150, y: 100, n: 'Mentor: Hinton'},
          {x: 350, y: 100, n: 'Co-Author: LeCun'},
          {x: 150, y: 300, n: 'Student: Sutskever'},
          {x: 350, y: 300, n: 'Peer: Bengio'},
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="12" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
            <text x={node.x} y={node.y + 25} textAnchor="middle" fill="#94a3b8" className="text-[10px]">{node.n}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};
