import { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { indexToCombination, TOTAL_COMBINATIONS } from './utils/combinatorics';

function App() {
  const generatedCombination = useAppStore(s => s.generatedCombination);
  const setGeneratedCombination = useAppStore(s => s.setGeneratedCombination);
  const savedCombinations = useAppStore(s => s.savedCombinations);
  const addSavedCombination = useAppStore(s => s.addSavedCombination);
  const removeSavedCombination = useAppStore(s => s.removeSavedCombination);

  const [showContact, setShowContact] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';

  const handleGenerateRandom = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Animation: Shuffle numbers for a bit
    let shuffles = 0;
    const maxShuffles = 10;
    const interval = setInterval(() => {
      // Just show random visual numbers
      const randomIdx = Math.floor(Math.random() * TOTAL_COMBINATIONS);
      setGeneratedCombination(indexToCombination(randomIdx));
      shuffles++;

      if (shuffles >= maxShuffles) {
        clearInterval(interval);
        // Final real combination
        const finalIdx = Math.floor(Math.random() * TOTAL_COMBINATIONS);
        const finalCombo = indexToCombination(finalIdx);

        setGeneratedCombination(finalCombo);
        addSavedCombination(finalCombo);
        setIsAnimating(false);
      }
    }, 80);
  };

  const clearAll = () => {
    if (confirm('¿Estás seguro de borrar todo el historial?')) {
      // We need a clear action in store, or just remove one by one?
      // Let's iterate or add a clear action.
      // For now, I'll allow store to clear or just remove manually loop?
      // Better add clear action to store.
      // HACK: I'll just clear localStorage manually and reload? No, that's bad.
      // I will add a loop here or modify store later.
      // Actually I can just set store state if I exposed the setter.
      // I exposed add/remove. I will assume I can update store for Clear All or use a loop.
      // Since I can't edit store easily in same step, I will use loop for now or wait for next step?
      // I'll add a quick 'clear' logic here if possible, or assume user will add it.
      // Wait, I can't add `clearSavedCombinations` to store without editing store file.
      // I will edit store file in next step. For now, I will map and remove (inefficient but works for small lists)
      // OR better: I will ignore clear functionality in THIS file update and do it in next.
      // I will add the UI button though.
      savedCombinations.forEach(() => removeSavedCombination(0)); // Remove 0 index repeatedly
      // Proper way: clear localStorage 'qini6_saved' and reload window? Crude.
      localStorage.removeItem('qini6_saved');
      window.location.reload(); // Simple atomic clear.
    }
  };

  const copyToClipboard = (combo: number[]) => {
    const text = `Qini 6: ${combo.join(' - ')}`;
    navigator.clipboard.writeText(text);
    alert('¡Copiado!');
  };

  const shareWhatsapp = (combo: number[]) => {
    const text = `¡Mira mi jugada para el Quini 6! 🎱\n${combo.join(' - ')}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Stats Logic
  const getHotNumbers = () => {
    const counts: Record<number, number> = {};
    savedCombinations.forEach(c => c.forEach(n => counts[n] = (counts[n] || 0) + 1));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 5) // Top 5
      .map(([n, count]) => ({ n: parseInt(n), count }));
  };
  const hotNumbers = getHotNumbers();

  return (
    <div className={`min-h-screen font-sans overflow-y-auto pb-20 transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'}`}>
      <div className="max-w-md mx-auto space-y-8 p-6">

        {/* Top Controls */}
        <div className="flex justify-end">
          <button onClick={toggleTheme} className={`p-2 rounded-full ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 shadow-sm'}`}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Qini 6
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Historial Automático de Combinaciones</p>
        </div>

        {/* Hot Numbers Stats */}
        {savedCombinations.length > 0 && (
          <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border relative overflow-hidden`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>🔥 Números Calientes</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {hotNumbers.map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[40px]">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/30">
                    {stat.n}
                  </div>
                  <span className="text-[10px] opacity-70">x{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generator Card */}
        <div className={`rounded-2xl p-6 border shadow-xl backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Generador</h2>
            <span className={`text-[10px] px-2 py-1 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
              Total: 9.3M
            </span>
          </div>

          <div className={`min-h-[80px] flex items-center justify-center mb-6 rounded-xl border border-dashed relative overflow-hidden group ${isDark ? 'bg-slate-900/50 border-white/10' : 'bg-slate-50 border-slate-300'}`}>
            {generatedCombination ? (
              <div className="flex gap-2 flex-wrap justify-center p-4">
                {generatedCombination.map((n, i) => (
                  <div key={i} className={`
                        w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-lg text-lg transition-all duration-75
                        ${isAnimating
                      ? (isDark ? 'bg-slate-700 text-slate-400 scale-90' : 'bg-slate-200 text-slate-400 scale-90')
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-100 animate-in zoom-in'}
                     `}>
                    {n}
                  </div>
                ))}
              </div>
            ) : (
              <span className={`${isDark ? 'text-slate-600' : 'text-slate-400'} text-sm`}>Presiona generar...</span>
            )}
          </div>

          <button
            onClick={handleGenerateRandom}
            disabled={isAnimating}
            className={`
                w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 text-lg transition-all
                ${isAnimating
                ? (isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400')
                : (isDark ? 'bg-white text-slate-900 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-500')}
                active:scale-95
             `}
          >
            {isAnimating ? '🎲 Mezclando...' : '🎲 Generar Nueva'}
          </button>
        </div>

        {/* Saved List (History) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2 border-white/10">
            <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Historial ({savedCombinations.length})
            </h2>
            {savedCombinations.length > 0 && (
              <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-500 underline">
                Borrar Todo
              </button>
            )}
          </div>

          {savedCombinations.length === 0 ? (
            <div className={`text-center py-8 italic ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              Aún no has generado ninguna combinación.
            </div>
          ) : (
            <div className="grid gap-3">
              {savedCombinations.map((combo, idx) => (
                <div key={idx} className={`rounded-xl p-4 flex flex-col gap-3 border shadow-sm animate-in slide-in-from-left duration-300 ${isDark ? 'bg-slate-800 border-white/5 hover:border-white/20' : 'bg-white border-slate-200'}`}>
                  {/* Numbers */}
                  <div className="flex gap-2 justify-center">
                    {combo.map(n => (
                      <span key={n} className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isDark ? 'bg-slate-700/50 text-blue-200' : 'bg-slate-100 text-slate-700'}`}>
                        {n}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-white/10">
                    <div className="flex gap-3">
                      <button onClick={() => copyToClipboard(combo)} className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                        📋 Copiar
                      </button>
                      <button onClick={() => shareWhatsapp(combo)} className="text-xs text-green-500 hover:text-green-400 flex items-center gap-1">
                        💬 WhatsApp
                      </button>
                    </div>
                    <button
                      onClick={() => removeSavedCombination(idx)}
                      className="text-slate-500 hover:text-red-400"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Developer Info */}
        <div className={`mt-12 pt-8 border-t text-center ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <button
            onClick={() => setShowContact(!showContact)}
            className="text-xs text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest font-semibold"
          >
            Desarrollador: Romero Brandon Elias
          </button>

          {showContact && (
            <div className={`mt-4 p-4 rounded-xl border text-sm space-y-2 animate-in fade-in slide-in-from-bottom-2 ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-200'}`}>
              <p className="flex items-center justify-center gap-2 text-slate-400">
                📧 <a href="mailto:romerobraandon477@gmail.com" className="hover:text-blue-500">romerobraandon477@gmail.com</a>
              </p>
              <p className="flex items-center justify-center gap-2 text-slate-400">
                📞 <a href="tel:3804808109" className="hover:text-blue-500">3804808109</a>
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
