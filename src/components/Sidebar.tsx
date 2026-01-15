import { useAppStore } from '../store/useAppStore';
import { indexToCombination, TOTAL_COMBINATIONS, indexToPosition } from '../utils/combinatorics';
import SearchForm from './SearchForm';

interface SidebarProps {
    onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
    const includedNumbers = useAppStore(s => s.includedNumbers);
    const setIncludedNumbers = useAppStore(s => s.setIncludedNumbers);
    const hoveredIndex = useAppStore(s => s.hoveredIndex);
    const generatedCombination = useAppStore(s => s.generatedCombination);
    const setGeneratedCombination = useAppStore(s => s.setGeneratedCombination);

    // Toggle a number in the filter
    const toggleNumber = (num: number) => {
        if (includedNumbers.includes(num)) {
            setIncludedNumbers(includedNumbers.filter(n => n !== num));
        } else {
            if (includedNumbers.length >= 6) return; // Max 6
            setIncludedNumbers([...includedNumbers, num].sort((a, b) => a - b));
        }
    };

    const handleGenerateRandom = () => {
        const randomIdx = Math.floor(Math.random() * TOTAL_COMBINATIONS);
        const combo = indexToCombination(randomIdx);
        setGeneratedCombination(combo);
        // Optionally focus viewing it?
    };

    // 0 to 45
    const allNumbers = Array.from({ length: 46 }, (_, i) => i);

    // Details of hovered point
    const hoveredCombo = hoveredIndex !== null ? indexToCombination(hoveredIndex) : null;
    const hoveredPos = hoveredIndex !== null ? indexToPosition(hoveredIndex) : null;

    return (
        <div className="pointer-events-auto h-full bg-slate-900/95 backdrop-blur-md p-6 text-white border-l border-white/10 flex flex-col gap-6 overflow-y-auto rounded-t-2xl md:rounded-none shadow-2xl md:shadow-none">

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Explorador Qini 6
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Visualizando {TOTAL_COMBINATIONS.toLocaleString()} combinaciones
                    </p>
                </div>
                {/* Mobile Close Button */}
                {onClose && (
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1">
                        ✕
                    </button>
                )}
            </div>

            {/* Stats/Info Box */}
            {hoveredCombo ? (
                <div className="bg-slate-800 p-4 rounded-lg border border-blue-500/30">
                    <p className="text-xs text-blue-300 font-bold mb-2">COMBINACIÓN BAJO CURSOR</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {hoveredCombo.map(n => (
                            <span key={n} className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full font-bold shadow-lg">
                                {n}
                            </span>
                        ))}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono text-center">
                        IDX: {hoveredIndex} <br />
                        ({hoveredPos?.join(', ')})
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800/50 p-4 rounded-lg border border-dashed border-white/10 text-center text-sm text-slate-500 min-h-[100px] flex items-center justify-center">
                    Pasa el mouse sobre un punto
                </div>
            )}

            {/* Random Generator */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Generador</h3>
                <button
                    onClick={handleGenerateRandom}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg font-bold shadow-lg transition-all active:scale-95"
                >
                    🎲 Generar Aleatoria
                </button>
                {generatedCombination && (
                    <div className="mt-2 p-3 bg-emerald-900/30 rounded border border-emerald-500/30">
                        <div className="flex gap-2 justify-center flex-wrap">
                            {generatedCombination.map(n => (
                                <span key={n} className="w-6 h-6 flex items-center justify-center bg-emerald-600 rounded text-xs font-bold">
                                    {n}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Section */}
            <div className="space-y-2 border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Buscar Combinación</h3>
                <SearchForm />
            </div>

            {/* Filter Section */}
            <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Filtrar por Números</h3>
                    {includedNumbers.length > 0 && (
                        <button onClick={() => setIncludedNumbers([])} className="text-xs text-red-400 hover:text-red-300 underline">
                            Limpiar
                        </button>
                    )}
                </div>

                <p className="text-xs text-slate-500 mb-3">
                    Selecciona números para ver combinaciones que los contienen. (Max 6)
                </p>

                <div className="grid grid-cols-6 gap-2">
                    {allNumbers.map(num => {
                        const isActive = includedNumbers.includes(num);
                        const isDisabled = !isActive && includedNumbers.length >= 6;

                        return (
                            <button
                                key={num}
                                onClick={() => toggleNumber(num)}
                                disabled={isDisabled}
                                className={`
                  aspect-square rounded flex items-center justify-center font-bold text-sm transition-all
                  ${isActive
                                        ? 'bg-purple-600 text-white shadow-purple-500/50 shadow-lg scale-110 ring-2 ring-purple-300'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'}
                  ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                `}
                            >
                                {num}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="text-[10px] text-center text-slate-600">
                Qini 6 Visualizer v1.0
            </div>
        </div>
    );
}
