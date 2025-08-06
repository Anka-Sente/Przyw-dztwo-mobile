import React, { useState, useMemo, useEffect, useCallback } from 'react';

// --- Stałe i dane ---

const STATEMENTS = [
    { id: 1, text: 'Wyjaśniam moim pracownikom kierunki działania całej organizacji.' },
    { id: 2, text: 'Komunikując się z pracownikami opieram się niemal wyłącznie na rzeczowych argumentach.' },
    { id: 3, text: 'Zastanawiam się często, jakie potrzeby mają moi pracownicy.' },
    { id: 4, text: 'Traktuję przestrzeganie procedur/procesów jako jedną z najważniejszych rzeczy w mojej pracy.' },
    { id: 5, text: 'Przejawiam często zachowania dominujące.' },
    { id: 6, text: 'Lepiej działam w uporządkowanym otoczeniu niż w zmieniających się warunkach.' },
    { id: 7, text: 'Wykonując bieżące zadania mam na ogół na myśli strategię firmy.' },
    { id: 8, text: 'Staram się unikać ryzyka w swoich decyzjach.' },
    { id: 9, text: 'Zależy mi na tym, aby wśród moich pracowników panowała atmosfera wzajemnego szacunku.' },
    { id: 10, text: 'Wolę ewlucyjne zmiany niż radykalne przeobrażenia.' },
    { id: 11, text: 'Świadomie wykorzystuję emocje, aby przekonać moich pracowników do nowych pomysłów czy idei.' },
    { id: 12, text: 'Nie zależy mi na wywieraniu wpływu na innych ludzi.' },
    { id: 13, text: 'Dostrzegam na ogół zdolności moich pracowników.' },
    { id: 14, text: 'Wolę sprawdzone metody działania niż nowe i niepewne.' },
    { id: 15, text: 'Jeśli chcę coś przeforsować, potrafię budować koalicję wokół siebie.' },
    { id: 16, text: 'Wolę nadzorować wykonanie zadań niż inspirować do czegoś nowego.' },
    { id: 17, text: 'Stosuję niekonwencjonalne metody, aby przekonać innych do swoich racji.' },
    { id: 18, text: 'Uważam, że równowaga między życiem zawodowym i prywatnym jest ważniejsza niż poświęcanie się wyzwaniom zawodowym.' },
    { id: 19, text: 'Nie unikam konfliktów, jeśli mam przekonanie ważności swoich racji.' },
    { id: 20, text: 'Lepiej czuję się w wykonywaniu konkretnych i przewidywalnych zadań niż w realizacji dalekich celów.' },
];

const CATEGORIES_CONFIG = {
    cat5: { title: 'Opisuje mnie w bardzo dużym stopniu lub w pełni', capacity: 2, score: 5 },
    cat4: { title: 'Opisuje mnie w dużym stopniu', capacity: 5, score: 4 },
    cat3: { title: 'Opisuje mnie w przeciętnym stopniu', capacity: 6, score: 3 },
    cat2: { title: 'Opisuje mnie w małym stopniu', capacity: 5, score: 2 },
    cat1: { title: 'Opisuje mnie w minimalnym stopniu lub w ogóle', capacity: 2, score: 1 },
};

const INITIAL_SORT_STATE = {
    unassigned: STATEMENTS.map(s => s.id),
    cat5: [], cat4: [], cat3: [], cat2: [], cat1: [],
};

// --- Komponenty Aplikacji ---

// Komponent modalu potwierdzenia
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <p className="text-sm text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
                        Anuluj
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Kontynuuj mimo to
                    </button>
                </div>
            </div>
        </div>
    );
};

// Komponent pojedynczego stwierdzenia (teraz klikalny)
const StatementCard = ({ statement, onClick, isSelected, isMovable = true }) => (
    <div
        onClick={isMovable ? onClick : undefined}
        className={`flex items-center p-3 mb-2 bg-white border-2 rounded-lg shadow-sm transition-all ${
            isSelected
                ? 'border-blue-500 scale-105 shadow-md'
                : 'border-gray-300'
        } ${
            isMovable
                ? 'cursor-pointer hover:bg-gray-50'
                : 'opacity-75'
        }`}
    >
        <p className="text-sm text-gray-800 flex-grow select-none">{statement.id}. {statement.text}</p>
    </div>
);


// Komponent kategorii (teraz klikalny)
const CategoryBox = ({ id, config, statements, onClick, isTarget, onStatementClick }) => {
    const isFull = statements.length >= config.capacity;
    const borderColor = isFull ? 'border-green-500' : 'border-gray-300';

    return (
        <div
            onClick={onClick}
            className={`p-4 mb-4 bg-gray-50 rounded-xl border-2 border-dashed ${borderColor} transition-all ${isTarget ? 'bg-blue-100 border-blue-500' : ''}`}
        >
            <h3 className="font-semibold text-gray-700">{config.title}</h3>
            <p className={`text-sm mb-2 ${isFull ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                Wymagane: {config.capacity} | Umieszczono: {statements.length}
            </p>
            {isTarget && !isFull && (
                <div className="text-center p-4 my-2 bg-blue-200 text-blue-800 rounded-lg">
                    Dotknij tutaj, aby przypisać
                </div>
            )}
            <div className="min-h-[50px]">
                {statements.map(stmt => (
                    <StatementCard key={stmt.id} statement={stmt} onClick={() => onStatementClick(stmt.id)} isSelected={false} />
                ))}
            </div>
        </div>
    );
};

// Komponent fazy sortowania (przebudowany dla mobile)
const SortingPhase = ({ phaseTitle, onComplete }) => {
    const [sortedState, setSortedState] = useState(INITIAL_SORT_STATE);
    const [selectedStatementId, setSelectedStatementId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getStatementById = useCallback((id) => STATEMENTS.find(s => s.id === id), []);

    const handleStatementClick = useCallback((id) => {
        setSelectedStatementId(prevId => (prevId === id ? null : id));
    }, []);

    const handleCategoryClick = useCallback((categoryId) => {
        if (!selectedStatementId) return;

        const targetCategory = sortedState[categoryId];
        const targetConfig = CATEGORIES_CONFIG[categoryId];
        if (targetCategory.length >= targetConfig.capacity) {
            // Opcjonalnie: pokaż powiadomienie, że kategoria jest pełna
            return;
        }

        let sourceKey = 'unassigned';
        let sourceList = sortedState.unassigned;

        if (!sourceList.includes(selectedStatementId)) {
            for (const key in sortedState) {
                if (key !== 'unassigned' && sortedState[key].includes(selectedStatementId)) {
                    sourceKey = key;
                    break;
                }
            }
        }
        
        setSortedState(prevState => {
            const newState = { ...prevState };
            // Usuń z listy źródłowej
            newState[sourceKey] = prevState[sourceKey].filter(id => id !== selectedStatementId);
            // Dodaj do listy docelowej
            newState[categoryId] = [...prevState[categoryId], selectedStatementId];
            return newState;
        });

        setSelectedStatementId(null);

    }, [selectedStatementId, sortedState]);

    const isComplete = useMemo(() => {
        return sortedState.unassigned.length === 0 &&
            Object.keys(CATEGORIES_CONFIG).every(catId =>
                sortedState[catId].length === CATEGORIES_CONFIG[catId].capacity
            );
    }, [sortedState]);
    
    const processAndSubmit = useCallback(() => {
        const results = {};
        STATEMENTS.forEach(stmt => {
            results[stmt.id] = 0; // Domyślna wartość 0 dla wszystkich
        });

        for (const catId in CATEGORIES_CONFIG) {
            const score = CATEGORIES_CONFIG[catId].score;
            sortedState[catId].forEach(statementId => {
                results[statementId] = score;
            });
        }
        onComplete(results);
    }, [sortedState, onComplete]);

    const handleAttemptSubmit = useCallback(() => {
        if (isComplete) {
            processAndSubmit();
        } else {
            setIsModalOpen(true);
        }
    }, [isComplete, processAndSubmit]);

    const unassignedStatements = useMemo(() => sortedState.unassigned.map(id => getStatementById(id)), [sortedState.unassigned, getStatementById]);

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{phaseTitle}</h2>
            <p className="text-center text-gray-600 mb-6">
                {selectedStatementId ? "Teraz wybierz kategorię poniżej." : "Dotknij stwierdzenia, aby je wybrać."}
            </p>

            {/* Sekcja ze stwierdzeniami do posortowania */}
            <div className="mb-8 p-4 bg-gray-100 rounded-xl">
                <h3 className="font-semibold text-lg mb-4 text-gray-700">Stwierdzenia do przypisania</h3>
                {unassignedStatements.length > 0 ? (
                    unassignedStatements.map(stmt => (
                        <StatementCard
                            key={stmt.id}
                            statement={stmt}
                            onClick={() => handleStatementClick(stmt.id)}
                            isSelected={selectedStatementId === stmt.id}
                            isMovable={!selectedStatementId || selectedStatementId === stmt.id}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 p-4">Wszystkie stwierdzenia zostały przypisane!</p>
                )}
            </div>
            
            {/* Sekcja z kategoriami */}
            <div>
                <h3 className="font-semibold text-lg mb-4 text-gray-700">Twoje Kategorie</h3>
                {Object.keys(CATEGORIES_CONFIG).sort((a, b) => b.localeCompare(a)).map(catId => (
                    <CategoryBox
                        key={catId}
                        id={catId}
                        config={CATEGORIES_CONFIG[catId]}
                        statements={sortedState[catId].map(id => getStatementById(id))}
                        onClick={() => handleCategoryClick(catId)}
                        isTarget={!!selectedStatementId}
                        onStatementClick={handleStatementClick}
                    />
                ))}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={handleAttemptSubmit}
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all"
                >
                    Zatwierdź i kontynuuj
                </button>
                {!isComplete && (
                    <p className="text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg p-2 mt-4 max-w-md mx-auto">
                        <b>Uwaga:</b> Nie wszystkie stwierdzenia zostały przypisane lub kategorie nie są w pełni zapełnione.
                    </p>
                )}
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onConfirm={() => {
                    setIsModalOpen(false);
                    processAndSubmit();
                }}
                onCancel={() => setIsModalOpen(false)}
                title="Potwierdzenie"
                message="Nie wszystkie kategorie zostały w pełni uzupełnione. Czy na pewno chcesz kontynuować? Nieprzypisane stwierdzenia otrzymają najniższą ocenę."
            />
        </div>
    );
};

// Komponent ekranu wyników
const ResultsScreen = ({ resultsAm, resultsWannabe, onRestart }) => {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const getCategoryTitleByScore = useCallback((score) => {
        if (score === 0) return 'Nieprzypisane';
        for (const catId in CATEGORIES_CONFIG) {
            if (CATEGORIES_CONFIG[catId].score === score) {
                return CATEGORIES_CONFIG[catId].title;
            }
        }
        return 'Brak opisu';
    }, []);

    const analysis = useMemo(() => {
        const allDifferences = STATEMENTS.map(statement => {
            const scoreAm = resultsAm[statement.id];
            const scoreWannabe = resultsWannabe[statement.id];
            const diff = Math.abs(scoreAm - scoreWannabe);
            return { ...statement, scoreAm, scoreWannabe, diff };
        }).sort((a, b) => b.diff - a.diff);

        const evenOddAnalysis = {
            am: { even: 0, odd: 0 },
            wannabe: { even: 0, odd: 0 },
        };

        STATEMENTS.forEach(statement => {
            if (resultsAm[statement.id] >= 3) {
                statement.id % 2 === 0 ? evenOddAnalysis.am.even++ : evenOddAnalysis.am.odd++;
            }
            if (resultsWannabe[statement.id] >= 3) {
                statement.id % 2 === 0 ? evenOddAnalysis.wannabe.even++ : evenOddAnalysis.wannabe.odd++;
            }
        });

        return { allDifferences, evenOddAnalysis };
    }, [resultsAm, resultsWannabe]);

    const handleGeneratePdf = useCallback(() => {
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;

        const input = document.getElementById('pdf-content');
        if (!input || !jsPDF || !html2canvas) {
            console.error("PDF generation resources not available.");
            return;
        }
        setIsGeneratingPdf(true);

        html2canvas(input, { scale: 2, useCORS: true })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const imgHeight = pdfWidth / ratio;
                
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdf.internal.pageSize.getHeight();
                }
                pdf.save('raport-q-sort.pdf');
                setIsGeneratingPdf(false);
            }).catch(err => {
                console.error("Error generating PDF:", err);
                setIsGeneratingPdf(false);
            });
    }, []);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div id="pdf-content">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Twoje Osobiste Spostrzeżenia</h2>

                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Analiza Różnic</h3>
                    <p className="text-gray-600 mb-6">Poniżej znajdują się wszystkie stwierdzenia, posortowane od największej do najmniejszej różnicy między Twoim obecnym "ja" a idealnym "ja".</p>
                    <ul className="space-y-4">
                        {analysis.allDifferences.map(item => (
                            <li key={item.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="font-semibold text-gray-800">{item.id}. {item.text}</p>
                                <p className="text-sm text-blue-800 mt-1">
                                    Różnica: <span className="font-bold">{item.diff} pkt</span>
                                </p>
                                <div className="text-xs text-gray-700 mt-2 p-2 bg-blue-100 rounded">
                                    <p><strong className="font-medium">Jaki jestem:</strong> {getCategoryTitleByScore(item.scoreAm)}</p>
                                    <p><strong className="font-medium">Jaki chcę być:</strong> {getCategoryTitleByScore(item.scoreWannabe)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Profil Przywództwa</h3>
                    <p className="text-gray-600 mb-6">Poniższa tabela pokazuje balans cech (parzyste - przywództwo transakcyjne vs nieparzyste - przywództwo transformacyjne), które uznałeś/aś za istotne (ocena 3-5 pkt).</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 bg-gray-100 font-semibold text-gray-700 border-b-2 border-gray-200">Profil</th>
                                    <th className="p-3 bg-gray-100 font-semibold text-gray-700 border-b-2 border-gray-200 text-center">Stwierdzenia Nieparzyste (transformacyjne)</th>
                                    <th className="p-3 bg-gray-100 font-semibold text-gray-700 border-b-2 border-gray-200 text-center">Stwierdzenia Parzyste (transakcyjne)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="p-3 font-bold text-gray-800">JAKI JESTEM</td>
                                    <td className="p-3 text-center text-2xl font-bold text-gray-800">{analysis.evenOddAnalysis.am.odd}</td>
                                    <td className="p-3 text-center text-2xl font-bold text-gray-800">{analysis.evenOddAnalysis.am.even}</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-bold text-gray-800">JAKI CHCIAŁBYM BYĆ</td>
                                    <td className="p-3 text-center text-2xl font-bold text-gray-800">{analysis.evenOddAnalysis.wannabe.odd}</td>
                                    <td className="p-3 text-center text-2xl font-bold text-gray-800">{analysis.evenOddAnalysis.wannabe.even}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="text-center mt-8 print:hidden space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center">
                <button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isGeneratingPdf ? 'Generowanie PDF...' : 'Pobierz raport PDF'}
                </button>
                <button
                    onClick={onRestart}
                    className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg shadow-md hover:bg-gray-800 transition-all"
                >
                    Rozpocznij od nowa
                </button>
            </div>
        </div>
    );
};

// Komponent ekranu powitalnego
const WelcomeScreen = ({ onStart }) => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">Ścieżka do Samopoznania Q-Sort</h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
            To interaktywne ćwiczenie pomoże Ci zrozumieć, kim jesteś i kim pragniesz się stać. Posortuj stwierdzenia w dwóch etapach, aby odkryć kluczowe informacje o swojej osobistej podróży.
        </p>
        <button
            onClick={onStart}
            className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-xl hover:bg-blue-700 transform hover:scale-105 transition-all"
        >
            Rozpocznij Test
        </button>
    </div>
);


// Główny komponent aplikacji
export default function App() {
    const [phase, setPhase] = useState('welcome'); // welcome, sortingAm, sortingWannabe, results
    const [resultsAm, setResultsAm] = useState(null);
    const [resultsWannabe, setResultsWannabe] = useState(null);

    useEffect(() => {
        const loadScript = (src, id) => {
            if (document.getElementById(id)) return;
            const script = document.createElement('script');
            script.src = src;
            script.id = id;
            script.async = true;
            document.head.appendChild(script);
        };

        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-script');
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas-script');
    }, []);

    const handleStart = () => {
        setPhase('sortingAm');
    };

    const handleCompleteAm = (results) => {
        setResultsAm(results);
        setPhase('sortingWannabe');
    };

    const handleCompleteWannabe = (results) => {
        setResultsWannabe(results);
        setPhase('results');
    };

    const handleRestart = () => {
        setResultsAm(null);
        setResultsWannabe(null);
        setPhase('welcome');
    };

    const renderPhase = () => {
        switch (phase) {
            case 'sortingAm':
                return <SortingPhase key="sortingAm" phaseTitle="Etap 1: Jaki jestem?" onComplete={handleCompleteAm} />;
            case 'sortingWannabe':
                return <SortingPhase key="sortingWannabe" phaseTitle="Etap 2: Jaki chciałbym być?" onComplete={handleCompleteWannabe} />;
            case 'results':
                return <ResultsScreen key="results" resultsAm={resultsAm} resultsWannabe={resultsWannabe} onRestart={handleRestart} />;
            case 'welcome':
            default:
                return <WelcomeScreen key="welcome" onStart={handleStart} />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <main className="container mx-auto">
                {renderPhase()}
            </main>
        </div>
    );
}
