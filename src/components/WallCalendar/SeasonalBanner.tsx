import React from 'react';

interface Props {
  month: number; // 0-11
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function Snowflake({ x, y, size, op }: { x: number; y: number; size: number; op: number }) {
  const s = size;
  return (
    <g transform={`translate(${x},${y})`} opacity={op} stroke="white" strokeWidth={s * 0.12} fill="none" strokeLinecap="round">
      <line x1={-s} y1={0} x2={s} y2={0} />
      <line x1={0} y1={-s} x2={0} y2={s} />
      <line x1={-s * 0.7} y1={-s * 0.7} x2={s * 0.7} y2={s * 0.7} />
      <line x1={s * 0.7} y1={-s * 0.7} x2={-s * 0.7} y2={s * 0.7} />
      {/* branch tips */}
      <line x1={-s * 0.5} y1={-s * 0.2} x2={-s * 0.7} y2={0} />
      <line x1={s * 0.5} y1={s * 0.2} x2={s * 0.7} y2={0} />
      <line x1={0} y1={-s * 0.6} x2={s * 0.2} y2={-s * 0.5} />
      <line x1={0} y1={s * 0.6} x2={-s * 0.2} y2={s * 0.5} />
    </g>
  );
}

// Heart path centered at (0,0), radius ~r
function HeartPath({ x, y, r, op, rotate = 0 }: { x: number; y: number; r: number; op: number; rotate?: number }) {
  const s = r;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate})`} opacity={op}>
      <path
        d={`M 0,${s * 0.3} C ${-s * 1.1},${-s * 0.5} ${-s * 1.1},${-s * 1.3} 0,${-s * 0.5} C ${s * 1.1},${-s * 1.3} ${s * 1.1},${-s * 0.5} 0,${s * 0.3} Z`}
        fill="white"
        stroke="none"
      />
    </g>
  );
}

// Simple 5-petal flower
function Flower({ x, y, r, op }: { x: number; y: number; r: number; op: number }) {
  return (
    <g transform={`translate(${x},${y})`} opacity={op} fill="white">
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx={Math.cos((angle * Math.PI) / 180) * r}
          cy={Math.sin((angle * Math.PI) / 180) * r}
          rx={r * 0.6}
          ry={r * 0.35}
          transform={`rotate(${angle} ${Math.cos((angle * Math.PI) / 180) * r} ${Math.sin((angle * Math.PI) / 180) * r})`}
        />
      ))}
      <circle cx={0} cy={0} r={r * 0.35} fill="rgba(255,220,100,0.6)" />
    </g>
  );
}

// ─── Month banners ────────────────────────────────────────────────────────────

// January: Snowfall scene
function JanuaryBanner() {
  const flakes = [
    { x: 60, y: 50, s: 18, op: 0.35 }, { x: 160, y: 130, s: 10, op: 0.22 },
    { x: 280, y: 60, s: 14, op: 0.28 }, { x: 380, y: 160, s: 22, op: 0.18 },
    { x: 490, y: 40, s: 12, op: 0.30 }, { x: 580, y: 120, s: 18, op: 0.25 },
    { x: 680, y: 70, s: 10, op: 0.32 }, { x: 740, y: 180, s: 20, op: 0.20 },
    { x: 120, y: 220, s: 8,  op: 0.18 }, { x: 330, y: 240, s: 14, op: 0.22 },
    { x: 520, y: 210, s: 10, op: 0.20 }, { x: 650, y: 250, s: 8,  op: 0.15 },
  ];
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Snow ground */}
      <ellipse cx={400} cy={310} rx={500} ry={80} fill="white" opacity={0.08} />
      <ellipse cx={400} cy={320} rx={400} ry={60} fill="white" opacity={0.06} />
      {flakes.map((f, i) => <Snowflake key={i} x={f.x} y={f.y} size={f.s} op={f.op} />)}
      {/* Tiny snow dots */}
      {[40, 100, 200, 310, 420, 540, 630, 710, 770].map((x, i) => (
        <circle key={i} cx={x} cy={90 + (i % 4) * 40} r={2.5} fill="white" opacity={0.18} />
      ))}
    </svg>
  );
}

// February: Floating hearts
function FebruaryBanner() {
  const hearts = [
    { x: 80,  y: 80,  r: 22, op: 0.25, rot: -15 },
    { x: 200, y: 160, r: 14, op: 0.20, rot: 10  },
    { x: 340, y: 60,  r: 30, op: 0.18, rot: -5  },
    { x: 450, y: 180, r: 18, op: 0.22, rot: 20  },
    { x: 560, y: 70,  r: 24, op: 0.20, rot: -12 },
    { x: 660, y: 150, r: 16, op: 0.28, rot: 8   },
    { x: 730, y: 60,  r: 20, op: 0.18, rot: -8  },
    { x: 140, y: 240, r: 12, op: 0.15, rot: 15  },
    { x: 400, y: 240, r: 10, op: 0.15, rot: -10 },
    { x: 620, y: 240, r: 14, op: 0.15, rot: 5   },
  ];
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Soft radial glow */}
      <defs>
        <radialGradient id="febGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity={0.08} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={800} height={300} fill="url(#febGlow)" />
      {hearts.map((h, i) => <HeartPath key={i} x={h.x} y={h.y} r={h.r} op={h.op} rotate={h.rot} />)}
      {/* Small sparkle dots */}
      {[50, 170, 290, 410, 530, 670, 760].map((x, i) => (
        <circle key={i} cx={x} cy={50 + (i % 3) * 80} r={2} fill="white" opacity={0.25} />
      ))}
    </svg>
  );
}

// March: Cherry blossom branch
function MarchBanner() {
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Main branch */}
      <path d="M -20,320 Q 80,200 200,150 Q 350,90 500,110 Q 620,125 720,80" stroke="white" strokeWidth={6} fill="none" opacity={0.25} strokeLinecap="round" />
      {/* Side branches */}
      <path d="M 200,150 Q 220,100 260,70" stroke="white" strokeWidth={3.5} fill="none" opacity={0.20} strokeLinecap="round" />
      <path d="M 350,115 Q 370,65 410,45" stroke="white" strokeWidth={3} fill="none" opacity={0.18} strokeLinecap="round" />
      <path d="M 500,110 Q 530,60 560,50" stroke="white" strokeWidth={2.5} fill="none" opacity={0.18} strokeLinecap="round" />
      {/* Blossoms — scattered circles */}
      {[
        [190,148],[215,130],[240,112],[255,92],[265,72],
        [350,110],[375,88],[395,68],[415,50],
        [490,108],[515,85],[545,65],[560,50],
        [600,115],[630,100],[660,88],[690,80],[715,78],
        [130,185],[160,165],[85,210],
      ].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={8 + (i%3)*2} fill="white" opacity={0.18} />
          <circle cx={cx} cy={cy} r={4} fill="rgba(255,180,200,0.4)" opacity={0.5} />
        </g>
      ))}
      {/* Falling petals */}
      {[100,250,390,520,650,760].map((x,i) => (
        <ellipse key={i} cx={x} cy={200 + (i%3)*30} rx={6} ry={4} fill="white" opacity={0.12} transform={`rotate(${30+i*20} ${x} ${200+(i%3)*30})`} />
      ))}
    </svg>
  );
}

// April: Rain
function AprilBanner() {
  const lines: [number,number,number][] = [];
  for (let i = 0; i < 30; i++) {
    lines.push([i * 28 - 20, -10 + (i % 5) * 35, 40 + (i % 3) * 12]);
  }
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Rain streaks */}
      {lines.map(([x, y, len], i) => (
        <line key={i} x1={x} y1={y} x2={x - 12} y2={y + len} stroke="white" strokeWidth={1.2} opacity={0.12 + (i % 4) * 0.04} strokeLinecap="round" />
      ))}
      {/* Ground puddles */}
      <ellipse cx={200} cy={295} rx={80} ry={12} fill="white" opacity={0.08} />
      <ellipse cx={550} cy={295} rx={60} ry={10} fill="white" opacity={0.07} />
      {/* Umbrella silhouette */}
      <path d="M 680,200 Q 680,120 600,100 Q 520,80 520,160 Z" fill="white" opacity={0.07} />
      <line x1={600} y1={160} x2={600} y2={240} stroke="white" strokeWidth={3} opacity={0.10} strokeLinecap="round" />
      {/* Ripple circles in puddles */}
      <ellipse cx={200} cy={290} rx={20} ry={5} fill="none" stroke="white" strokeWidth={1} opacity={0.10} />
      <ellipse cx={550} cy={290} rx={15} ry={4} fill="none" stroke="white" strokeWidth={1} opacity={0.10} />
    </svg>
  );
}

// May: Wildflower meadow
function MayBanner() {
  const flowers = [
    { x: 60, y: 220, r: 14 }, { x: 130, y: 200, r: 10 }, { x: 210, y: 230, r: 16 },
    { x: 290, y: 210, r: 12 }, { x: 370, y: 225, r: 14 }, { x: 440, y: 200, r: 10 },
    { x: 510, y: 220, r: 16 }, { x: 590, y: 205, r: 12 }, { x: 660, y: 230, r: 14 },
    { x: 730, y: 210, r: 10 }, { x: 170, y: 140, r: 10 }, { x: 360, y: 150, r: 12 },
    { x: 560, y: 145, r: 10 },
  ];
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Rolling hills */}
      <path d="M 0,260 Q 200,200 400,230 Q 600,260 800,210 L 800,300 L 0,300 Z" fill="white" opacity={0.06} />
      <path d="M 0,280 Q 200,240 400,260 Q 600,280 800,250 L 800,300 L 0,300 Z" fill="white" opacity={0.08} />
      {/* Stems */}
      {flowers.map((f, i) => (
        <line key={`stem-${i}`} x1={f.x} y1={f.y + f.r} x2={f.x + (i % 3 - 1) * 5} y2={280} stroke="white" strokeWidth={1.5} opacity={0.12} strokeLinecap="round" />
      ))}
      {flowers.map((f, i) => (
        <Flower key={i} x={f.x} y={f.y} r={f.r} op={0.18 + (i % 3) * 0.04} />
      ))}
      {/* Butterflies */}
      <g opacity={0.15} fill="white">
        <ellipse cx={300} cy={120} rx={14} ry={8} transform="rotate(-30 300 120)" />
        <ellipse cx={322} cy={118} rx={10} ry={6} transform="rotate(20 322 118)" />
      </g>
    </svg>
  );
}

// June: Beach & sun
function JuneBanner() {
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Sunrays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const cx = 680; const cy = 60;
        const r1 = 55; const r2 = 110;
        return (
          <line key={i}
            x1={cx + Math.cos(angle) * r1} y1={cy + Math.sin(angle) * r1}
            x2={cx + Math.cos(angle) * r2} y2={cy + Math.sin(angle) * r2}
            stroke="white" strokeWidth={2.5} opacity={0.20} strokeLinecap="round"
          />
        );
      })}
      {/* Sun */}
      <circle cx={680} cy={60} r={46} fill="white" opacity={0.14} />
      <circle cx={680} cy={60} r={30} fill="white" opacity={0.14} />
      {/* Ocean waves */}
      <path d="M 0,230 Q 100,210 200,230 Q 300,250 400,230 Q 500,210 600,230 Q 700,250 800,230 L 800,300 L 0,300 Z" fill="white" opacity={0.09} />
      <path d="M 0,250 Q 100,235 200,250 Q 300,265 400,250 Q 500,235 600,250 Q 700,265 800,250 L 800,300 L 0,300 Z" fill="white" opacity={0.07} />
      {/* Wave crests */}
      {[50, 170, 310, 450, 590, 720].map((x, i) => (
        <path key={i} d={`M ${x},225 Q ${x+20},215 ${x+40},225`} stroke="white" strokeWidth={2} fill="none" opacity={0.16} strokeLinecap="round" />
      ))}
      {/* Beach */}
      <path d="M 0,270 Q 400,255 800,268 L 800,300 L 0,300 Z" fill="white" opacity={0.06} />
    </svg>
  );
}

// July: Fireworks
function JulyBanner() {
  const bursts = [
    { cx: 200, cy: 80,  rays: 14, r: 80,  op: 0.22 },
    { cx: 460, cy: 50,  rays: 12, r: 100, op: 0.18 },
    { cx: 680, cy: 100, rays: 16, r: 70,  op: 0.20 },
    { cx: 100, cy: 160, rays: 10, r: 50,  op: 0.15 },
    { cx: 600, cy: 180, rays: 10, r: 55,  op: 0.15 },
  ];
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {bursts.map((b, bi) =>
        Array.from({ length: b.rays }).map((_, i) => {
          const angle = (i * (360 / b.rays) * Math.PI) / 180;
          const variation = b.r * (0.7 + (i % 3) * 0.2);
          return (
            <line key={`${bi}-${i}`}
              x1={b.cx} y1={b.cy}
              x2={b.cx + Math.cos(angle) * variation}
              y2={b.cy + Math.sin(angle) * variation}
              stroke="white" strokeWidth={1.8} opacity={b.op} strokeLinecap="round"
            />
          );
        })
      )}
      {/* Burst centers */}
      {bursts.map((b, i) => <circle key={i} cx={b.cx} cy={b.cy} r={4} fill="white" opacity={b.op * 1.5} />)}
      {/* Trailing sparks */}
      {[120, 260, 380, 520, 640, 760].map((x, i) => (
        <circle key={i} cx={x} cy={100 + (i % 4) * 40} r={2} fill="white" opacity={0.18} />
      ))}
    </svg>
  );
}

// August: Mountain + forest silhouette
function AugustBanner() {
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Back mountains */}
      <polygon points="0,300 80,100 200,200 350,60 520,180 650,80 800,160 800,300" fill="white" opacity={0.07} />
      {/* Front mountains */}
      <polygon points="0,300 150,150 300,220 450,100 600,200 750,120 800,180 800,300" fill="white" opacity={0.09} />
      {/* Pine trees silhouette */}
      {[40, 100, 160, 220, 280, 560, 620, 680, 740].map((x, i) => {
        const h = 50 + (i % 3) * 15;
        return (
          <g key={i} opacity={0.13}>
            <polygon points={`${x},${280-h} ${x-12},280 ${x+12},280`} fill="white" />
            <polygon points={`${x},${280-h*0.7} ${x-15},${280-h*0.25} ${x+15},${280-h*0.25}`} fill="white" />
          </g>
        );
      })}
      {/* Stars */}
      {[50, 130, 220, 360, 490, 620, 750].map((x, i) => (
        <circle key={i} cx={x} cy={30 + (i % 3) * 25} r={2} fill="white" opacity={0.20} />
      ))}
    </svg>
  );
}

// September: Falling autumn leaves
function SeptemberBanner() {
  const leaves = [
    { x: 80,  y: 60,  r: 16, rot: 30  },
    { x: 180, y: 140, r: 12, rot: -45 },
    { x: 300, y: 80,  r: 18, rot: 60  },
    { x: 420, y: 160, r: 14, rot: -20 },
    { x: 530, y: 50,  r: 16, rot: 45  },
    { x: 640, y: 130, r: 12, rot: -60 },
    { x: 720, y: 70,  r: 18, rot: 25  },
    { x: 140, y: 230, r: 10, rot: -30 },
    { x: 370, y: 240, r: 14, rot: 50  },
    { x: 580, y: 220, r: 10, rot: -40 },
    { x: 680, y: 250, r: 12, rot: 15  },
  ];
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x},${l.y}) rotate(${l.rot})`} opacity={0.18 + (i % 3) * 0.04} fill="white">
          {/* Simple maple-leaf shape */}
          <path d={`M 0,-${l.r} C ${l.r * 0.4},-${l.r * 0.8} ${l.r * 0.9},-${l.r * 0.4} ${l.r * 0.6},0 C ${l.r},${l.r * 0.3} ${l.r * 0.3},${l.r * 0.8} 0,${l.r * 0.4} C ${-l.r * 0.3},${l.r * 0.8} ${-l.r},${l.r * 0.3} ${-l.r * 0.6},0 C ${-l.r * 0.9},-${l.r * 0.4} ${-l.r * 0.4},-${l.r * 0.8} 0,-${l.r} Z`} />
          <line x1={0} y1={-l.r * 0.8} x2={0} y2={l.r * 0.3} stroke="rgba(255,255,255,0.3)" strokeWidth={1} fill="none" />
        </g>
      ))}
      {/* Ground */}
      <path d="M 0,275 Q 200,260 400,272 Q 600,284 800,265 L 800,300 L 0,300 Z" fill="white" opacity={0.06} />
    </svg>
  );
}

// October: Moon, bats and bare branches
function OctoberBanner() {
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Moon */}
      <circle cx={650} cy={80} r={55} fill="white" opacity={0.12} />
      {/* Moon crescent mask illusion via second circle */}
      <circle cx={680} cy={65} r={46} fill="black" opacity={0.05} />
      {/* Moon glow halo */}
      <circle cx={650} cy={80} r={75} fill="white" opacity={0.04} />
      {/* Bare tree */}
      <line x1={120} y1={300} x2={120} y2={140} stroke="white" strokeWidth={6} opacity={0.15} strokeLinecap="round" />
      <line x1={120} y1={200} x2={60}  y2={140} stroke="white" strokeWidth={3.5} opacity={0.12} strokeLinecap="round" />
      <line x1={120} y1={180} x2={190} y2={120} stroke="white" strokeWidth={3} opacity={0.12} strokeLinecap="round" />
      <line x1={60}  y1={140} x2={30}  y2={90}  stroke="white" strokeWidth={2} opacity={0.10} strokeLinecap="round" />
      <line x1={60}  y1={140} x2={90}  y2={100} stroke="white" strokeWidth={2} opacity={0.10} strokeLinecap="round" />
      <line x1={190} y1={120} x2={160} y2={70}  stroke="white" strokeWidth={2} opacity={0.10} strokeLinecap="round" />
      <line x1={190} y1={120} x2={230} y2={80}  stroke="white" strokeWidth={2} opacity={0.10} strokeLinecap="round" />
      {/* Bats (simplified wing shape) */}
      {[[350,100], [430,70], [520,120], [590,90]].map(([bx,by],i) => (
        <g key={i} transform={`translate(${bx},${by})`} opacity={0.18} fill="white">
          <path d={`M 0,0 Q -18,-14 -26,2 Q -18,-2 0,4 Q 18,-2 26,2 Q 18,-14 0,0 Z`} />
          <circle cx={0} cy={-2} r={3} />
        </g>
      ))}
      {/* Stars */}
      {[200, 320, 450, 720, 760, 40].map((x, i) => (
        <circle key={i} cx={x} cy={30 + (i%4)*20} r={1.5} fill="white" opacity={0.25} />
      ))}
    </svg>
  );
}

// November: Misty hills and bare trees
function NovemberBanner() {
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Layered misty hills */}
      <path d="M 0,220 Q 150,160 300,200 Q 450,240 600,180 Q 720,140 800,200 L 800,300 L 0,300 Z" fill="white" opacity={0.05} />
      <path d="M 0,240 Q 200,200 400,230 Q 600,260 800,220 L 800,300 L 0,300 Z" fill="white" opacity={0.06} />
      <path d="M 0,265 Q 200,245 400,258 Q 600,270 800,250 L 800,300 L 0,300 Z" fill="white" opacity={0.07} />
      {/* Mist / fog bands */}
      <rect x={0} y={180} width={800} height={25} fill="white" opacity={0.04} />
      <rect x={0} y={215} width={800} height={20} fill="white" opacity={0.04} />
      {/* Bare trees in fog */}
      {[80, 250, 420, 580, 730].map((x, ti) => (
        <g key={ti} opacity={0.12} stroke="white" strokeLinecap="round" fill="none">
          <line x1={x} y1={280} x2={x} y2={160} strokeWidth={4} />
          <line x1={x} y1={220} x2={x - 30} y2={175} strokeWidth={2.5} />
          <line x1={x} y1={210} x2={x + 35} y2={165} strokeWidth={2.5} />
          <line x1={x - 30} y1={175} x2={x - 48} y2={145} strokeWidth={1.5} />
          <line x1={x + 35} y1={165} x2={x + 55} y2={138} strokeWidth={1.5} />
        </g>
      ))}
      {/* Birds in distance */}
      {[200, 320, 360, 500, 540].map((x, i) => (
        <path key={i} d={`M ${x},${60+(i%3)*15} Q ${x+8},${55+(i%3)*15} ${x+16},${60+(i%3)*15}`} stroke="white" strokeWidth={1.5} fill="none" opacity={0.16} />
      ))}
    </svg>
  );
}

// December: Starry winter night with snow hills
function DecemberBanner() {
  const stars = [
    [60,30],[140,55],[240,20],[360,45],[450,15],[570,40],[680,25],[760,50],
    [100,90],[280,80],[420,95],[550,70],[700,85],
    [30,120],[180,110],[340,130],[500,105],[640,120],[780,100],
  ];
  const bigFlakes = [
    { x: 150, y: 180, s: 14 }, { x: 350, y: 140, s: 18 }, { x: 550, y: 170, s: 14 },
    { x: 700, y: 150, s: 16 }, { x: 80, y: 230, s: 10 }, { x: 450, y: 240, s: 12 },
  ];
  return (
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Stars */}
      {stars.map(([x,y],i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <circle cx={0} cy={0} r={i % 5 === 0 ? 2.5 : 1.5} fill="white" opacity={0.22 + (i%3)*0.06} />
        </g>
      ))}
      {/* Snowflakes */}
      {bigFlakes.map((f, i) => <Snowflake key={i} x={f.x} y={f.y} size={f.s} op={0.18} />)}
      {/* Snow hills */}
      <path d="M 0,260 Q 100,220 200,240 Q 300,260 400,235 Q 500,210 600,240 Q 700,265 800,245 L 800,300 L 0,300 Z" fill="white" opacity={0.10} />
      <path d="M 0,278 Q 150,255 300,272 Q 450,288 600,265 Q 700,252 800,268 L 800,300 L 0,300 Z" fill="white" opacity={0.08} />
      {/* Christmas tree silhouette */}
      <g opacity={0.10} fill="white">
        <polygon points="400,180 375,240 425,240" />
        <polygon points="400,160 370,215 430,215" />
        <polygon points="400,135 365,195 435,195" />
        <rect x={392} y={240} width={16} height={20} />
      </g>
    </svg>
  );
}

const BANNERS = [
  JanuaryBanner, FebruaryBanner, MarchBanner, AprilBanner, MayBanner, JuneBanner,
  JulyBanner, AugustBanner, SeptemberBanner, OctoberBanner, NovemberBanner, DecemberBanner,
];

export function SeasonalBanner({ month }: Props) {
  const Banner = BANNERS[month % 12];
  return <Banner />;
}
