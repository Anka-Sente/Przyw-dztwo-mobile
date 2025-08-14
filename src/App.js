import React, { useState, useMemo, useEffect, useCallback } from 'react';

// --- BRANDING FIRMOWY ---
const THEME = {
     colors: {
        primary: '#801540',
        primaryHover: '#e61269',
        background: '#ffffff',
        cardBackground: '#ffffff',
        textPrimary: '#000000',
        textSecondary: '#b2b2b2',
    }
};

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
    cat5: { title: '5: Opisuje mnie w bardzo dużym stopniu lub w pełni', capacity: 2, score: 5 },
    cat4: { title: '4: Opisuje mnie w dużym stopniu', capacity: 5, score: 4 },
    cat3: { title: '3: Opisuje mnie w przeciętnym stopniu', capacity: 6, score: 3 },
    cat2: { title: '2: Opisuje mnie w małym stopniu', capacity: 5, score: 2 },
    cat1: { title: '1: Opisuje mnie w minimalnym stopniu lub w ogóle', capacity: 2, score: 1 },
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
                <h3 className="text-base font-bold mb-4" style={{ color: THEME.colors.textPrimary }}>{title}</h3>
                <p className="text-xs mb-6" style={{ color: THEME.colors.textSecondary }}>{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm">
                        Anuluj
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: THEME.colors.primary }}>
                        Kontynuuj mimo to
                    </button>
                </div>
            </div>
        </div>
    );
};

// Komponent pojedynczego stwierdzenia (klikalny)
const StatementCard = ({ statement, onClick, isSelected, isMovable = true }) => (
    <div
        onClick={isMovable ? onClick : undefined}
        className={`flex items-center p-3 mb-2 border-2 rounded-lg shadow-sm transition-all ${
            isSelected ? 'scale-105 shadow-md' : ''
        } ${
            isMovable ? 'cursor-pointer hover:opacity-80' : 'opacity-75'
        }`}
        style={{ 
            backgroundColor: THEME.colors.cardBackground,
            borderColor: isSelected ? THEME.colors.primary : '#e5e7eb',
            color: THEME.colors.textPrimary
        }}
    >
        <p className="text-xs flex-grow select-none">{statement.id}. {statement.text}</p>
    </div>
);


// Komponent kategorii (klikalny)
const CategoryBox = ({ id, config, statements, onClick, isTarget, onStatementClick }) => {
    const isFull = statements.length >= config.capacity;

    return (
        <div
            onClick={onClick}
            className={`p-4 mb-4 rounded-xl border-2 border-dashed transition-all`}
            style={{ 
                borderColor: isTarget ? THEME.colors.primary : (isFull ? '#4ade80' : '#d1d5db'),
                backgroundColor: isTarget ? `${THEME.colors.primary}1A` : '#f9fafb'
            }}
        >
            <h3 className="font-semibold text-sm" style={{ color: THEME.colors.textPrimary }}>{config.title}</h3>
            <p className={`text-xs mb-2 ${isFull ? 'font-bold' : ''}`} style={{ color: isFull ? '#16a34a' : THEME.colors.textSecondary }}>
                Wymagane: {config.capacity} | Umieszczono: {statements.length}
            </p>
            {isTarget && !isFull && (
                <div className="text-center p-4 my-2 rounded-lg text-sm" style={{ backgroundColor: `${THEME.colors.primary}33`, color: THEME.colors.primary }}>
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

// Komponent fazy sortowania
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
            return;
        }

        let sourceKey = 'unassigned';
        if (!sortedState.unassigned.includes(selectedStatementId)) {
            for (const key in sortedState) {
                if (key !== 'unassigned' && sortedState[key].includes(selectedStatementId)) {
                    sourceKey = key;
                    break;
                }
            }
        }
        
        setSortedState(prevState => {
            const newState = { ...prevState };
            newState[sourceKey] = prevState[sourceKey].filter(id => id !== selectedStatementId);
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
            results[stmt.id] = 0;
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
            <h2 className="text-xl font-bold text-center mb-2" style={{ color: THEME.colors.textPrimary }}>{phaseTitle}</h2>
            <p className="text-center mb-6 text-sm" style={{ color: THEME.colors.textSecondary }}>
                {selectedStatementId ? "Teraz wybierz kategorię poniżej." : "Dotknij stwierdzenia, aby je wybrać."}
            </p>

            <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: '#eef2f6' }}>
                <h3 className="font-semibold text-base mb-4" style={{ color: THEME.colors.textPrimary }}>Stwierdzenia do przypisania</h3>
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
                    <p className="text-center p-4 text-sm" style={{ color: THEME.colors.textSecondary }}>Wszystkie stwierdzenia zostały przypisane!</p>
                )}
            </div>
            
            <div>
                <h3 className="font-semibold text-base mb-4" style={{ color: THEME.colors.textPrimary }}>Twoje Kategorie</h3>
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
                    className="w-full md:w-auto px-8 py-3 text-white font-bold rounded-lg shadow-md transition-all text-sm"
                    style={{ backgroundColor: THEME.colors.primary }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = THEME.colors.primaryHover}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = THEME.colors.primary}
                >
                    Zatwierdź i kontynuuj
                </button>
                {!isComplete && (
                    <p className="text-xs text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg p-2 mt-4 max-w-md mx-auto">
                        <b>Uwaga:</b> Nie wszystkie stwierdzenia zostały przypisane lub kategorie nie są w pełni zapełnione.
                    </p>
                )}
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onConfirm={() => { setIsModalOpen(false); processAndSubmit(); }}
                onCancel={() => setIsModalOpen(false)}
                title="Potwierdzenie"
                message="Nie wszystkie kategorie zostały w pełni uzupełnione. Czy na pewno chcesz kontynuować? Nieprzypisane stwierdzenia otrzymają najniższą ocenę."
            />
        </div>
    );
};

// Komponent z tekstem do refleksji nad analizą różnic
const AnalysisReflection = () => (
    <div className="p-6 rounded-xl shadow-lg mb-8" style={{ backgroundColor: THEME.colors.cardBackground, color: THEME.colors.textSecondary }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: THEME.colors.textPrimary }}>ANALIZA RÓŻNIC - Poddaj wyniki refleksji</h2>
        <p className="mb-4 text-sm">
            Zacznij od pierwszej sekcji - ona pokazuje twierdzenia z największymi rozbieżnościami, pomiędzy tym, jak postrzegasz siebie dziś (jaki jestem), a tym jaki chciałbyś być. Czyli miejsca, w których chciałbyś zmienić natężenie pewnej postawy czy umiejętności.
            To ważne punkty - pokazują gdzie niewielkie zmiany mogą przynieść korzyści dla Twojego poczucia spójności.
        </p>
        <p className="mb-4 text-sm">
            Analizując te twierdzenia, zwróć uwagę na dwa główne scenariusze:
        </p>

        <h3 className="text-base font-bold mt-6 mb-2" style={{ color: THEME.colors.textPrimary }}>Wynik "CHCIAŁBYM BYĆ" jest wyższy niż "JESTEM"</h3>
        <p className="mb-4 text-sm">
            Pokazuje to Twój kierunek rozwoju.
        </p>
        <h4 className="text-sm font-bold mt-4 mb-2" style={{ color: THEME.colors.textPrimary }}>Pytania do refleksji:</h4>
        <div className="space-y-3 text-sm">
            <p><span className="mr-3">💡</span><strong>Motywacja:</strong> Dlaczego ta cecha jest dla Ciebie ważna? Jakie korzyści przyniesie Ci jej wzmocnienie w życiu zawodowym i prywatnym? Jakie konkretne sytuacje w przyszłości mogłyby wyglądać inaczej, gdybyś posiadał/a tę cechę w większym stopniu?</p>
            <p><span className="mr-3">🚧</span><strong>Przeszkody:</strong> Co obecnie powstrzymuje Cię przed pełnym rozwinięciem tego zachowania? Czy są to Twoje wewnętrzne przekonania, nawyki, a może czynniki zewnętrzne (środowisko, brak czasu)?</p>
            <p><span className="mr-3">👥</span><strong>Wzorce:</strong> Czy znasz kogoś, kto uosabia tę cechę w sposób, który podziwiasz? Czego możesz się od tej osoby nauczyć?</p>
            <p><span className="mr-3">👟</span><strong>Pierwszy krok:</strong> Jaki jest najmniejszy, możliwy do wykonania krok, który możesz podjąć w ciągu najbliższego tygodnia, aby zbliżyć się do swojego ideału w tym obszarze?</p>
        </div>

        <h3 className="text-base font-bold mt-6 mb-2" style={{ color: THEME.colors.textPrimary }}>Wynik "CHCIAŁBYM BYĆ" jest niższy niż "JESTEM"</h3>
        <p className="mb-4 text-sm">
            Sugeruje on, że cecha, którą obecnie posiadasz w dużym stopniu, w Twoim idealnym obrazie siebie jest mniej istotna lub wręcz niepożądana. Może to oznaczać, że czujesz, iż dana cecha kosztuje Cię zbyt wiele energii, lub że chcesz zrobić w swoim życiu miejsce na inne wartości. Ta luka wskazuje na potrzebę rekalibracji i świadomego ograniczenia pewnych zachowań, aby osiągnąć lepszą równowagę.
        </p>
        <h4 className="text-sm font-bold mt-4 mb-2" style={{ color: THEME.colors.textPrimary }}>Tutaj pytania do refleksji to:</h4>
        <div className="space-y-3 text-sm">
            <p><span className="mr-3">💸</span><strong>Koszt:</strong> Jaki jest koszt utrzymywania tej cechy na tak wysokim poziomie? Czy powoduje to stres, zmęczenie, czy może zaniedbywanie innych ważnych dla Ciebie obszarów?</p>
            <p><span className="mr-3">🎯</span><strong>Motywacja do zmiany:</strong> Dlaczego w Twoim idealnym obrazie siebie ta cecha jest mniej ważna? Jaką inną cechę lub wartość chcesz wzmocnić w jej miejsce?</p>
            <p><span className="mr-3">🍃</span><strong>Korzyści z odpuszczenia:</strong> Co zyskasz, jeśli pozwolisz sobie na bycie "mniej..." w tym konkretnym obszarze?</p>
            <p><span className="mr-3">👟</span><strong>Pierwszy krok:</strong> Jaka jest jedna sytuacja w nadchodzącym tygodniu, w której możesz świadomie spróbować zachować się inaczej?</p>
        </div>
    </div>
);

// Komponent z tekstem do refleksji nad profilem przywództwa
const LeadershipReflection = () => (
    <div className="p-6 rounded-xl shadow-lg mb-8" style={{ backgroundColor: THEME.colors.cardBackground, color: THEME.colors.textSecondary }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: THEME.colors.textPrimary }}>Profil Przywództwa - Poddaj wyniki refleksji</h2>
        <p className="mb-4 text-sm">
            Test został zaprojektowany tak, aby zmapować Twoje zachowania i aspiracje na dwa wpływowe style przywództwa, zdefiniowane przez badaczy takich jak Bernard M. Bass i James MacGregor Burns.
        </p>
        <p className="mb-4 text-sm">Stwierdzenia <strong>nieparzyste 🔢</strong> reprezentują przywództwo <strong>transformacyjne</strong>, które koncentruje się na inspirowaniu i rozwijaniu innych.</p>
        <p className="mb-4 text-sm">Stwierdzenia <strong>parzyste 🔢</strong> reprezentują przywództwo <strong>transakcyjne</strong>, które opiera się na wymianie, strukturze i jasnych zasadach.</p>
        <p className="mb-4 text-sm">Druga część wyniku - tabela, pokazuje Ci, który z tych stylów dominuje w Twoim postrzeganiu siebie ("JAKI JESTEM") oraz w Twoich dążeniach ("JAKI CHCIAŁBYM BYĆ").</p>

        <h3 className="text-base font-bold mt-6 mb-2" style={{ color: THEME.colors.textPrimary }}>Przywództwo Transformacyjne (Stwierdzenia Nieparzyste) 🚀</h3>
        <p className="mb-4 text-sm">
            Przywództwo transformacyjne to proces, w którym liderzy i ich zwolennicy wzajemnie motywują się do osiągania wyższych poziomów moralności i motywacji. Liderzy transformacyjni inspirują, rozwijają i zachęcają do przekraczania własnych interesów na rzecz dobra zespołu i organizacji. Model ten, rozwinięty przez Bassa i Avolio, opiera się na czterech kluczowych filarach (tzw. "4 I"):
        </p>
        <div className="space-y-3 mb-4 text-sm">
            <p><strong>Wyidealizowany Wpływ (Idealized Influence):</strong> Lider jest wzorem do naśladowania (role model), budzi zaufanie i szacunek. Działa w sposób etyczny i konsekwentny.</p>
            <p><strong>Inspirująca Motywacja (Inspirational Motivation):</strong> Lider tworzy i komunikuje atrakcyjną wizję przyszłości, wydobywa entuzjazm i optymizm, a także pokazuje sens wykonywanej pracy.</p>
            <p><strong>Stymulacja Intelektualna (Intellectual Stimulation):</strong> Lider zachęca do kwestionowania statusu quo, kreatywności i innowacyjnego myślenia. Problemy są postrzegane jako wyzwania, a nie przeszkody.</p>
            <p><strong>Zindywidualizowane Podejście (Individualized Consideration):</strong> Lider działa jak mentor lub coach, rozpoznaje indywidualne potrzeby i potencjał każdego członka zespołu, wspierając jego rozwój.</p>
        </div>
        
        <h4 className="text-sm font-bold mt-4 mb-2" style={{ color: THEME.colors.textPrimary }}>Zalety (Potwierdzone Badaniami)</h4>
        <div className="space-y-3 mb-4 text-sm">
            <p><span className="mr-3">👍</span><strong>Wysoka efektywność i zaangażowanie:</strong> Badania konsekwentnie wykazują silny, pozytywny związek między przywództwem transformacyjnym a satysfakcją z pracy, motywacją i zaangażowaniem pracowników.</p>
            <p><span className="mr-3">💡</span><strong>Innowacyjność i kreatywność:</strong> Stymulacja intelektualna bezpośrednio przekłada się na zdolność zespołu do generowania nowatorskich rozwiązań.</p>
            <p><span className="mr-3">🏆</span><strong>Lepsze wyniki zespołowe:</strong> Zespoły kierowane przez liderów transformacyjnych często osiągają wyższe wyniki, zwłaszcza w dynamicznym i niepewnym środowisku.</p>
            <p><span className="mr-3">🌱</span><strong>Rozwój pracowników:</strong> Indywidualne podejście sprzyja budowaniu kompetencji i lojalności w zespole.</p>
        </div>
        
        <h4 className="text-sm font-bold mt-4 mb-2" style={{ color: THEME.colors.textPrimary }}>Wady i Ryzyka</h4>
        <div className="space-y-3 mb-4 text-sm">
            <p><span className="mr-3">🔥</span><strong>Ryzyko wypalenia:</strong> Zarówno lider, jak i zespół mogą odczuwać presję związaną z ciągłym dążeniem do ideałów i transformacji.</p>
            <p><span className="mr-3">⏳</span><strong>Mniejsza skuteczność w stabilnych warunkach:</strong> W środowiskach, które wymagają przede wszystkim utrzymania procesów i standardów, ten styl może być postrzegany jako chaotyczny lub niepraktyczny.</p>
            <p><span className="mr-3">🎭</span><strong>Potencjalne nadużycia:</strong> Charyzma i wpływ mogą być wykorzystywane w sposób nieetyczny do manipulowania zwolennikami (tzw. pseudoprzywództwo transformacyjne).</p>
        </div>

        <h3 className="text-base font-bold mt-6 mb-2" style={{ color: THEME.colors.textPrimary }}>Przywództwo Transakcyjne (Stwierdzenia Parzyste) ⚙️</h3>
        <p className="mb-4 text-sm">Przywództwo transakcyjne opiera się na procesie wymiany między liderem a pracownikiem. Lider określa jasne cele i oczekiwania, a następnie nagradza za ich realizację lub koryguje odchylenia. Koncentruje się na zarządzaniu, organizacji i wydajności w ramach istniejących struktur.</p>
        
        <h4 className="text-sm font-bold mt-4 mb-2" style={{ color: THEME.colors.textPrimary }}>Główne komponenty tego stylu to:</h4>
        <div className="space-y-3 mb-4 text-sm">
            <p><strong>Warunkowe Nagradzanie (Contingent Reward):</strong> Lider ustala z pracownikami, co muszą zrobić, aby otrzymać określoną nagrodę (np. premię, awans). To klasyczna relacja "coś za coś".</p>
            <p><strong>Zarządzanie przez Wyjątki (Management-by-Exception):</strong> Aktywne (lider monitoruje i koryguje na bieżąco) lub Pasywne (lider interweniuje, gdy pojawią się problemy).</p>
        </div>

        <h4 className="text-sm font-bold mt-4 mb-2" style={{ color: THEME.colors.textPrimary }}>Zalety (Potwierdzone Badaniami)</h4>
        <div className="space-y-3 mb-4 text-sm">
            <p><span className="mr-3">📋</span><strong>Przejrzystość i struktura:</strong> Pracownicy dokładnie wiedzą, czego się od nich oczekuje i co otrzymają w zamian. Redukuje to niepewność.</p>
            <p><span className="mr-3">⏱️</span><strong>Wydajność w krótkim terminie:</strong> Styl ten jest bardzo skuteczny w osiąganiu konkretnych, dobrze zdefiniowanych celów krótkoterminowych.</p>
            <p><span className="mr-3">🚨</span><strong>Skuteczność w sytuacjach kryzysowych:</strong> W sytuacjach wymagających szybkiego działania i jasnych poleceń, przywództwo transakcyjne zapewnia porządek i kontrolę.</p>
            <p><span className="mr-3">⚖️</span><strong>Obiektywizm:</strong> Oceny i nagrody są oparte na mierzalnych wynikach, co może być postrzegane jako sprawiedliwe.</p>
        </div>

        <h4 className="text-sm font-bold mt-4 mb-2" style={{ color: THEME.colors.textPrimary }}>Wady i Ryzyka</h4>
        <div className="space-y-3 mb-4 text-sm">
            <p><span className="mr-3">🎨</span><strong>Ograniczanie kreatywności:</strong> Pracownicy skupiają się na spełnianiu minimum wymaganego do otrzymania nagrody, rzadko wychodząc poza schematy.</p>
            <p><span className="mr-3">💔</span><strong>Niska motywacja wewnętrzna:</strong> Styl ten odwołuje się głównie do motywacji zewnętrznej (nagrody/kary), ignorując potrzebę sensu i rozwoju.</p>
            <p><span className="mr-3">👀</span><strong>Reaktywność zamiast proaktywności:</strong> Zwłaszcza w formie pasywnej, liderzy reagują na problemy, zamiast im zapobiegać.</p>
            <p><span className="mr-3">🔄</span><strong>Utrzymywanie statusu quo:</strong> Nie sprzyja zmianom ani długoterminowemu rozwojowi organizacji.</p>
        </div>

        <p className="mb-4 text-sm"><strong>"JAKI JESTEM":</strong> Spójrz na proporcje w pierwszym wierszu tabeli. Jeśli dominują liczby nieparzyste, Twoje postrzeganie siebie skłania się ku inspirującemu stylowi transformacyjnemu. Jeśli przeważają liczby parzyste, bliżej Ci do ustrukturyzowanego stylu transakcyjnego. Zrównoważony wynik sugeruje, że już teraz łączysz cechy obu podejść.</p>
        <p className="mb-4 text-sm"><strong>"JAKI CHCIAŁBYM BYĆ":</strong> Porównaj pierwszy wiersz z drugim. Czy dążysz do zwiększenia liczby stwierdzeń nieparzystych? Oznacza to chęć bycia bardziej inspirującym i rozwijającym liderem. A może chcesz zwiększyć liczbę parzystych? To wskazuje na potrzebę wprowadzenia większej struktury, jasności i przewidywalności w Twoje działania.</p>
        <p className="font-bold mt-4 text-sm" style={{ color: THEME.colors.textPrimary }}>Współczesne badania, zwłaszcza w ramach Modelu Pełnego Zakresu Przywództwa (Full Range Leadership Model), pokazują, że najskuteczniejsi liderzy są elastyczni. Potrafią stosować oba style – transformacyjny, by budować wizję i angażować zespół na dłuższą metę, oraz transakcyjny, by zapewnić sprawne działanie i realizację bieżących zadań.</p>
        <p className="font-bold mt-2 text-sm" style={{ color: THEME.colors.textPrimary }}>Jakiego stylu w obecnym momencie najbardziej potrzebuje Twój zespół?</p>
        <p className="mt-6 text-xs">Zachęcamy Cię do dalszej analizy wyników po warsztatach samodzielnie i/lub z Twoim HRBP.</p>
    </div>
);

// Komponent ekranu wyników
const ResultsScreen = ({ resultsAm, resultsWannabe, onRestart }) => {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showReflectionInPdf, setShowReflectionInPdf] = useState(false);

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

    useEffect(() => {
        if (!showReflectionInPdf) {
            return;
        }

        const generate = async () => {
            const { jsPDF } = window.jspdf;
            const html2canvas = window.html2canvas;
            const input = document.getElementById('pdf-content');

            if (!input || !jsPDF || !html2canvas) {
                console.error("PDF generation resources not available.");
                setShowReflectionInPdf(false);
                setIsGeneratingPdf(false);
                return;
            }

            try {
                const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: THEME.colors.background });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const imgHeight = pdfWidth / ratio;
                
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }
                pdf.save('raport-q-sort.pdf');
            } catch (err) {
                console.error("Error generating PDF:", err);
            } finally {
                setShowReflectionInPdf(false);
                setIsGeneratingPdf(false);
            }
        };

        const timer = setTimeout(generate, 100);
        return () => clearTimeout(timer);

    }, [showReflectionInPdf]);

    const handleGeneratePdfClick = () => {
        if (isGeneratingPdf) return;
        setIsGeneratingPdf(true);
        setShowReflectionInPdf(true);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <style>{`
                .pdf-page-break-after { break-after: page; page-break-after: always; }
                .pdf-no-break { break-inside: avoid; page-break-inside: avoid; }
            `}</style>

            <div id="pdf-content" className="p-2 md:p-4" style={{ backgroundColor: THEME.colors.background }}>
                <h2 className="text-xl font-bold text-center my-4" style={{ color: THEME.colors.textPrimary }}>Twoje Osobiste Spostrzeżenia</h2>

                <div className="p-6 rounded-xl shadow-lg mb-4 pdf-no-break" style={{ backgroundColor: THEME.colors.cardBackground }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: THEME.colors.textPrimary }}>Analiza Różnic</h3>
                    <p className="mb-6 text-sm" style={{ color: THEME.colors.textSecondary }}>Poniżej znajdują się wszystkie stwierdzenia, posortowane od największej do najmniejszej różnicy między Twoim obecnym "ja" a idealnym "ja".</p>
                    <ul className="space-y-4">
                        {analysis.allDifferences.map((item, index) => (
                            <li key={item.id} 
                                className={`p-4 border rounded-lg pdf-no-break ${
                                    (index === 4 || index === 10 || index === 16) ? 'pdf-page-break-after' : ''
                                }`} 
                                style={{ backgroundColor: `${THEME.colors.primary}1A`, borderColor: `${THEME.colors.primary}4D` }}
                            >
                                <p className="font-semibold text-sm" style={{ color: THEME.colors.textPrimary }}>{item.id}. {item.text}</p>
                                <p className="text-xs mt-1" style={{ color: THEME.colors.primary }}>
                                    Różnica: <span className="font-bold">{item.diff} pkt</span>
                                </p>
                                <div className="text-xs mt-2 p-2 rounded" style={{ backgroundColor: `${THEME.colors.primary}33`, color: THEME.colors.textPrimary }}>
                                    <p><strong className="font-medium">Jaki jestem:</strong> {getCategoryTitleByScore(item.scoreAm)}</p>
                                    <p><strong className="font-medium">Jaki chcę być:</strong> {getCategoryTitleByScore(item.scoreWannabe)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="p-6 rounded-xl shadow-lg mb-8 pdf-no-break pdf-page-break-after" style={{ backgroundColor: THEME.colors.cardBackground }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: THEME.colors.textPrimary }}>Profil Przywództwa</h3>
                    <p className="mb-6 text-sm" style={{ color: THEME.colors.textSecondary }}>Poniższa tabela pokazuje balans cech (parzyste - przywództwo transakcyjne vs nieparzyste - przywództwo transformacyjne), które uznałeś/aś za istotne (ocena 3-5 pkt).</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="p-3 font-semibold border-b-2" style={{ backgroundColor: `${THEME.colors.primary}1A`, color: THEME.colors.textPrimary, borderColor: `${THEME.colors.primary}4D` }}>Profil</th>
                                    <th className="p-3 font-semibold border-b-2 text-center" style={{ backgroundColor: `${THEME.colors.primary}1A`, color: THEME.colors.textPrimary, borderColor: `${THEME.colors.primary}4D` }}>Stwierdzenia Nieparzyste (transformacyjne)</th>
                                    <th className="p-3 font-semibold border-b-2 text-center" style={{ backgroundColor: `${THEME.colors.primary}1A`, color: THEME.colors.textPrimary, borderColor: `${THEME.colors.primary}4D` }}>Stwierdzenia Parzyste (transakcyjne)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b" style={{ borderColor: '#e5e7eb' }}>
                                    <td className="p-3 font-bold" style={{ color: THEME.colors.textPrimary }}>JAKI JESTEM</td>
                                    <td className="p-3 text-center text-xl font-bold" style={{ color: THEME.colors.textPrimary }}>{analysis.evenOddAnalysis.am.odd}</td>
                                    <td className="p-3 text-center text-xl font-bold" style={{ color: THEME.colors.textPrimary }}>{analysis.evenOddAnalysis.am.even}</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-bold" style={{ color: THEME.colors.textPrimary }}>JAKI CHCIAŁBYM BYĆ</td>
                                    <td className="p-3 text-center text-xl font-bold" style={{ color: THEME.colors.textPrimary }}>{analysis.evenOddAnalysis.wannabe.odd}</td>
                                    <td className="p-3 text-center text-xl font-bold" style={{ color: THEME.colors.textPrimary }}>{analysis.evenOddAnalysis.wannabe.even}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="reflection-for-pdf" style={{ display: showReflectionInPdf ? 'block' : 'none' }}>
                    <div className="pdf-page-break-after">
                        <AnalysisReflection />
                    </div>
                    <LeadershipReflection />
                </div>

            </div>
            <div className="text-center mt-8 print:hidden space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center">
                <button
                    onClick={handleGeneratePdfClick}
                    disabled={isGeneratingPdf}
                    className="px-8 py-3 text-white font-bold rounded-lg shadow-md transition-all disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    style={{ backgroundColor: '#16a34a' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#15803d'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#16a34a'}
                >
                    {isGeneratingPdf ? 'Generowanie PDF...' : 'Pobierz raport PDF'}
                </button>
                <button
                    onClick={onRestart}
                    className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg shadow-md hover:bg-gray-800 transition-all text-sm"
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
        <h1 className="text-2xl md:text-3xl font-extrabold my-8" style={{ color: THEME.colors.textPrimary }}>Ścieżka do Samopoznania Q-Sort</h1>
        <p className="text-base max-w-2xl mb-8" style={{ color: THEME.colors.textSecondary }}>
            To interaktywne ćwiczenie pomoże Ci zrozumieć, kim jesteś i kim pragniesz się stać. Posortuj stwierdzenia w dwóch etapach, aby odkryć kluczowe informacje o swojej osobistej podróży.
        </p>
        <button
            onClick={onStart}
            className="px-10 py-4 text-white font-bold text-base rounded-lg shadow-xl transform hover:scale-105 transition-all"
            style={{ backgroundColor: THEME.colors.primary }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = THEME.colors.primaryHover}
            onMouseOut={e => e.currentTarget.style.backgroundColor = THEME.colors.primary}
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
        document.body.style.backgroundColor = THEME.colors.background;
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
        <div className="font-sans" style={{ backgroundColor: THEME.colors.background }}>
            <main className="container mx-auto">
                {renderPhase()}
            </main>
        </div>
    );
}
