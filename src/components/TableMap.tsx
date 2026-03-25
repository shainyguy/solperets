import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface Reservation {
  table_number: number;
  status: string;
  event_date: string;
  event_time: string;
  customer_name?: string;
  guests_count?: number;
}

interface TableMapProps {
  selectedDate: string;
  selectedTime: string;
  onBook: (tableNum: number) => void;
  onClose: () => void;
}

const TABLE_LAYOUT = [
  // Зона A (левая диагональная зона)
  { num: 1, x: 150, y: 445, zone: 'A', seats: 4 },
  { num: 2, x: 195, y: 395, zone: 'A', seats: 4 },
  { num: 3, x: 228, y: 350, zone: 'A', seats: 4 },
  { num: 4, x: 240, y: 430, zone: 'A', seats: 6 },
  { num: 5, x: 280, y: 365, zone: 'A', seats: 4 },
  { num: 6, x: 305, y: 290, zone: 'A', seats: 4 },
  // Зона B (центральная)
  { num: 7, x: 365, y: 310, zone: 'B', seats: 4 },
  { num: 8, x: 400, y: 250, zone: 'B', seats: 4 },
  { num: 9, x: 450, y: 330, zone: 'B', seats: 6 },
  { num: 10, x: 485, y: 260, zone: 'B', seats: 4 },
  { num: 11, x: 425, y: 420, zone: 'B', seats: 4 },
  { num: 15, x: 475, y: 420, zone: 'B', seats: 4 },
  // Зона C (правая)
  { num: 12, x: 590, y: 270, zone: 'C', seats: 4 },
  { num: 13, x: 700, y: 265, zone: 'C', seats: 6 },
  { num: 14, x: 830, y: 270, zone: 'C', seats: 4 },
  // Зона D (нижняя)
  { num: 16, x: 505, y: 502, zone: 'D', seats: 8 },
  { num: 17, x: 650, y: 502, zone: 'D', seats: 8 },
];

export default function TableMap({ selectedDate, selectedTime, onBook, onClose }: TableMapProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selected, setSelected] = useState<number | null>(null);


  useEffect(() => {
    if (!selectedDate) return;
    fetch(`/api/table-bookings?date=${selectedDate}`)
      .then(r => r.json())
      .then(d => setReservations(Array.isArray(d) ? d : []));
  }, [selectedDate]);

  const isBooked = (num: number) =>
    reservations.some(r => r.table_number === num &&
      r.status !== 'cancelled' &&
      (r.event_time === selectedTime || !selectedTime));

  const getTableColor = (num: number) => {
    if (selected === num) return '#E8631A';
    if (isBooked(num)) return '#ef4444';
    return '#22c55e';
  };

  const getTableStroke = (num: number) => {
    if (selected === num) return '#ff8c42';
    if (isBooked(num)) return '#dc2626';
    return '#16a34a';
  };

  const handleTableClick = (num: number) => {
    if (isBooked(num)) return;
    setSelected(prev => prev === num ? null : num);
  };

  const TABLE_W = 44;
  const TABLE_H = 44;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-white font-bold text-lg">Выберите стол</h2>
          <p className="text-white/50 text-sm">
            {selectedDate && new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            {selectedTime && ` · ${selectedTime}`}
          </p>
        </div>
        <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/50 border-b border-white/5 shrink-0 flex-wrap">
        {[
          { color: '#22c55e', label: 'Свободен' },
          { color: '#ef4444', label: 'Занят' },
          { color: '#E8631A', label: 'Выбран' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm" style={{ background: l.color }} />
            <span className="text-white/60 text-xs">{l.label}</span>
          </div>
        ))}
        <div className="ml-auto text-white/40 text-xs">17 столов · нажмите чтобы выбрать</div>
      </div>

      {/* SVG Map */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2 md:p-4">
        <svg
          viewBox="0 0 1050 620"
          className="w-full max-w-5xl"
          style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
        >
          <defs>
            <pattern id="floor2" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#1a1a2e"/>
              <rect width="20" height="20" fill="#1e1e35" opacity="0.6"/>
              <rect x="20" y="20" width="20" height="20" fill="#1e1e35" opacity="0.6"/>
            </pattern>
          </defs>

          {/* Venue outline */}
          <path d="M 100,490 L 310,225 L 890,225 L 890,560 L 435,560 L 435,490 Z"
            fill="url(#floor2)" stroke="#444" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Zone labels */}
          <text x="230" y="420" textAnchor="middle" fontSize="11" fill="#555" fontWeight="700" letterSpacing="3">ЗОНА A</text>
          <text x="450" y="245" textAnchor="middle" fontSize="11" fill="#555" fontWeight="700" letterSpacing="3">ЗОНА B</text>
          <text x="720" y="245" textAnchor="middle" fontSize="11" fill="#555" fontWeight="700" letterSpacing="3">ЗОНА C</text>
          <text x="660" y="555" textAnchor="middle" fontSize="11" fill="#555" fontWeight="700" letterSpacing="3">ЗОНА D</text>

          {/* Zone dividers */}
          <line x1="400" y1="228" x2="400" y2="487" stroke="#333" strokeWidth="1" strokeDasharray="6,4"/>
          <line x1="560" y1="228" x2="560" y2="487" stroke="#333" strokeWidth="1" strokeDasharray="6,4"/>
          <line x1="438" y1="490" x2="887" y2="490" stroke="#333" strokeWidth="1" strokeDasharray="6,4"/>

          {/* ВХОД */}
          <rect x="55" y="473" width="52" height="36" rx="8" fill="#E53935"/>
          <text x="81" y="496" textAnchor="middle" fontSize="10" fill="#FFF" fontWeight="700">ВХОД</text>
          <polygon points="107,491 120,484 120,498" fill="#E53935"/>

          {/* WC */}
          <rect x="500" y="150" width="158" height="70" rx="10" fill="#1b5e20"/>
          <text x="579" y="180" textAnchor="middle" fontSize="12" fill="#FFF" fontWeight="700">WC / КУРИЛКА</text>
          <text x="579" y="198" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">Туалет · Зона для курения</text>

          {/* БАР */}
          <rect x="890" y="268" width="75" height="170" rx="10" fill="#1565C0"/>
          <text transform="rotate(-90,927,353)" x="927" y="357" textAnchor="middle" fontSize="15" fill="#FFF" fontWeight="700" letterSpacing="3">БАР</text>

          {/* DJ */}
          <rect x="855" y="548" width="60" height="44" rx="10" fill="#F57F17"/>
          <text x="885" y="576" textAnchor="middle" fontSize="13" fill="#FFF" fontWeight="700">DJ</text>

          {/* Танцпол */}
          <rect x="660" y="345" width="148" height="103" rx="12" fill="rgba(156,39,176,0.12)" stroke="#9C27B0" strokeWidth="2" strokeDasharray="8,4"/>
          <text x="734" y="393" textAnchor="middle" fontSize="12" fill="#ce93d8" fontWeight="700" letterSpacing="1">ТАНЦПОЛ</text>

          {/* Tables */}
          {TABLE_LAYOUT.map(t => {
            const booked = isBooked(t.num);
            const sel = selected === t.num;
            const color = getTableColor(t.num);
            const stroke = getTableStroke(t.num);
            return (
              <g key={t.num}
                style={{ cursor: booked ? 'not-allowed' : 'pointer' }}
                onClick={() => handleTableClick(t.num)}

              >
                {/* Glow for selected */}
                {sel && (
                  <rect x={t.x - 4} y={t.y - 4} width={TABLE_W + 8} height={TABLE_H + 8}
                    rx="12" fill="none" stroke="#E8631A" strokeWidth="2" opacity="0.5">
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/>
                  </rect>
                )}
                <rect x={t.x} y={t.y} width={TABLE_W} height={TABLE_H}
                  rx="8" fill={color} stroke={stroke} strokeWidth="2"
                  opacity={booked ? 0.7 : 1}
                />
                <text x={t.x + TABLE_W / 2} y={t.y + TABLE_H / 2 + 5}
                  textAnchor="middle" fontSize={t.num >= 10 ? "13" : "15"} fill="#fff" fontWeight="700">
                  {t.num}
                </text>
                {/* Seats indicator */}
                <text x={t.x + TABLE_W / 2} y={t.y + TABLE_H + 12}
                  textAnchor="middle" fontSize="8" fill="#888">
                  {t.seats} мест
                </text>
                {booked && (
                  <text x={t.x + TABLE_W / 2} y={t.y + TABLE_H / 2 - 8}
                    textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)">
                    ✗
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom panel */}
      <div className="shrink-0 bg-zinc-900 border-t border-white/10 p-4">
        {selected ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold">Стол №{selected} выбран</p>
              <p className="text-white/50 text-sm">
                {TABLE_LAYOUT.find(t => t.num === selected)?.seats} мест · Зона {TABLE_LAYOUT.find(t => t.num === selected)?.zone}
              </p>
            </div>
            <button onClick={() => onBook(selected)}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2">
              <CheckCircle size={18} />
              Забронировать
            </button>
          </div>
        ) : (
          <div className="text-center text-white/40 text-sm py-1">
            Нажмите на зелёный стол для выбора
          </div>
        )}
      </div>
    </div>
  );
}
