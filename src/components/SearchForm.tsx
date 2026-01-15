import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { combinationToIndex } from '../utils/combinatorics';

export default function SearchForm() {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const setSearchedIndex = useAppStore(s => s.setSearchedIndex);
    const setIncludedNumbers = useAppStore(s => s.setIncludedNumbers);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Parse input (supports space, comma, dash separated)
        const numbers = input
            .split(/[\s,-]+/)
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n));

        // Validate
        if (numbers.length !== 6) {
            setError('Debes ingresar exactamente 6 números.');
            return;
        }

        // Check range and uniqueness
        const validRange = numbers.every(n => n >= 0 && n <= 45);
        const unique = new Set(numbers).size === 6;

        if (!validRange) {
            setError('Números deben ser entre 00 y 45.');
            return;
        }
        if (!unique) {
            setError('Los números no pueden repetirse.');
            return;
        }

        // Sort for index calculation
        const sorted = [...numbers].sort((a, b) => a - b);
        const idx = combinationToIndex(sorted);

        console.log("Searching for:", sorted, "Index:", idx);

        setSearchedIndex(idx);
        setIncludedNumbers([]); // Clear filter so we see context? Or set filter to these?
        // Let's clear filter so we see highlighted point among others
    };

    return (
        <form onSubmit={handleSearch} className="flex flex-col gap-2">
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ej: 00 05 10 20 35 45"
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold text-sm"
            >
                🔍 Buscar
            </button>
        </form>
    );
}
