import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import ProcessedTable from './components/ProcessedTable';
import FileMerger from './components/FileMerger';
import DailyWorkerAnalyzer from './components/DailyWorkerAnalyzer';
import ShiftIdentifier from './components/ShiftIdentifier';
import InformationAnalyzer from './components/InformationAnalyzer';
import GroupFilter from './components/GroupFilter';
import { processTimesheetFile, exportToExcel } from './services/timesheetService';
import { ProcessedShift } from './types';
import { FileDown, Calculator, Clock, AlertTriangle, Menu, X, LayoutDashboard, Merge, UserSquare2, Layers, Info, Filter } from 'lucide-react';

export type ViewType = 'PROCESSOR' | 'MERGER' | 'DAILY' | 'SHIFT_ID' | 'INFO' | 'FILTER';

const App: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedShift[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  // Navigation & Transfer State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('PROCESSOR');
  const [preloadedFile, setPreloadedFile] = useState<File | null>(null);

  // Auto-process preloaded file for main processor
  useEffect(() => {
      if (currentView === 'PROCESSOR' && preloadedFile) {
          handleFileSelected(preloadedFile);
          setPreloadedFile(null);
      }
  }, [currentView, preloadedFile]);

  const handleFileTransfer = (file: File, target: ViewType) => {
      setPreloadedFile(file);
      setCurrentView(target);
      setIsMenuOpen(false);
  };

  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);
    setProcessedData([]);

    try {
      // Small timeout to allow UI to update to "Processing" state
      setTimeout(async () => {
        try {
          const data = await processTimesheetFile(file);
          setProcessedData(data);
        } catch (err) {
          console.error(err);
          setError('Erro ao processar o arquivo. Verifique se as colunas "Pessoa" e "Data/Hora" existem.');
        } finally {
          setIsProcessing(false);
        }
      }, 100);
    } catch (e) {
      setIsProcessing(false);
      setError('Erro inesperado.');
    }
  };

  const handleDownload = () => {
    if (processedData.length > 0) {
      exportToExcel(processedData);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const navigateTo = (view: ViewType) => {
      setCurrentView(view);
      setIsMenuOpen(false);
      setPreloadedFile(null); // Reset transfer when manually navigating
  };

  const stats = {
    totalRecords: processedData.length,
    artificialLunches: processedData.filter(d => d.lunchType === 'ARTIFICIAL').length,
    totalHours: processedData.reduce((acc, curr) => acc + curr.workedHours, 0).toFixed(2)
  };

  const getTitle = () => {
      switch(currentView) {
          case 'PROCESSOR': return 'Tratamento de Ponto';
          case 'MERGER': return 'Unificação de Arquivos';
          case 'DAILY': return 'Análise de Diaristas';
          case 'SHIFT_ID': return 'Separação de Turnos';
          case 'INFO': return 'Cruzamento';
          case 'FILTER': return 'Filtro de Grupo';
          default: return '';
      }
  };

  // --- MAIN APP ---
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 relative overflow-x-hidden">
      
      {/* Mobile/Sidebar Overlay */}
      {isMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-800 border-r border-slate-700 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/50">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">Menu</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 hover:text-red-400 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <button 
                    onClick={() => navigateTo('PROCESSOR')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        currentView === 'PROCESSOR' 
                        ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-600/20' 
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    Tratamento de Ponto
                </button>

                <button 
                    onClick={() => navigateTo('MERGER')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        currentView === 'MERGER' 
                        ? 'bg-purple-600/20 text-purple-400 font-semibold border border-purple-600/20' 
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                    }`}
                >
                    <Merge className="w-5 h-5" />
                    Unificar Planilhas
                </button>

                <button 
                    onClick={() => navigateTo('DAILY')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        currentView === 'DAILY' 
                        ? 'bg-orange-600/20 text-orange-400 font-semibold border border-orange-600/20' 
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                    }`}
                >
                    <UserSquare2 className="w-5 h-5" />
                    Análise de Diaristas
                </button>

                <button 
                    onClick={() => navigateTo('SHIFT_ID')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        currentView === 'SHIFT_ID' 
                        ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-600/20' 
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                    }`}
                >
                    <Layers className="w-5 h-5" />
                    Identificação de Turno
                </button>

                <button 
                    onClick={() => navigateTo('FILTER')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        currentView === 'FILTER' 
                        ? 'bg-pink-600/20 text-pink-400 font-semibold border border-pink-600/20' 
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                    }`}
                >
                    <Filter className="w-5 h-5" />
                    Filtro
                </button>

                <button 
                    onClick={() => navigateTo('INFO')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        currentView === 'INFO' 
                        ? 'bg-teal-600/20 text-teal-400 font-semibold border border-teal-600/20' 
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                    }`}
                >
                    <Info className="w-5 h-5" />
                    Cruzamento
                </button>
            </nav>

            <div className="p-4 border-t border-slate-700">
                <p className="text-xs text-center text-slate-600 mt-4">Ponto Inteligente v1.6</p>
            </div>
        </div>
      </aside>

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg hidden sm:block shadow-lg shadow-blue-900/50">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Ponto Inteligente <span className="text-blue-500 font-light">Manager</span>
              </h1>
            </div>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block font-medium">
             {getTitle()}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {currentView === 'PROCESSOR' && (
            <div className="animate-fade-in space-y-8">
                {/* Intro / Instructions */}
                {processedData.length === 0 && !isProcessing && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 flex flex-col items-center text-center group hover:border-blue-500/50 transition-all hover:bg-slate-800/80">
                    <div className="w-12 h-12 bg-slate-700/50 text-blue-400 rounded-full flex items-center justify-center mb-4 font-bold text-lg group-hover:scale-110 transition-transform border border-slate-600">1</div>
                    <h3 className="font-semibold text-white mb-2">Upload</h3>
                    <p className="text-sm text-slate-400">Envie sua planilha bruta.</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 flex flex-col items-center text-center group hover:border-purple-500/50 transition-all hover:bg-slate-800/80">
                    <div className="w-12 h-12 bg-slate-700/50 text-purple-400 rounded-full flex items-center justify-center mb-4 font-bold text-lg group-hover:scale-110 transition-transform border border-slate-600">2</div>
                    <h3 className="font-semibold text-white mb-2">Processamento</h3>
                    <p className="text-sm text-slate-400">Cálculo automático de horas.</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 flex flex-col items-center text-center group hover:border-green-500/50 transition-all hover:bg-slate-800/80">
                    <div className="w-12 h-12 bg-slate-700/50 text-green-400 rounded-full flex items-center justify-center mb-4 font-bold text-lg group-hover:scale-110 transition-transform border border-slate-600">3</div>
                    <h3 className="font-semibold text-white mb-2">Exportação</h3>
                    <p className="text-sm text-slate-400">Baixe o relatório final.</p>
                    </div>
                </div>
                )}

                {/* Uploader Section */}
                <section className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 md:p-8">
                <div className="max-w-xl mx-auto">
                    <FileUploader onFileSelected={handleFileSelected} isProcessing={isProcessing} />
                    {error && (
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 animate-shake">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                    )}
                </div>
                </section>

                {/* Results Section */}
                {processedData.length > 0 && (
                <section className="space-y-6">
                    
                    {/* Actions & Stats Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700">
                    <div className="flex gap-6 text-sm overflow-x-auto">
                        <div>
                        <span className="block text-slate-500 text-xs uppercase font-bold tracking-wider">Registros</span>
                        <span className="font-bold text-lg text-white">{stats.totalRecords}</span>
                        </div>
                        <div>
                        <span className="block text-slate-500 text-xs uppercase font-bold tracking-wider">Total Horas</span>
                        <span className="font-bold text-lg text-blue-400">{stats.totalHours}h</span>
                        </div>
                        <div>
                        <span className="block text-slate-500 text-xs uppercase font-bold tracking-wider">Almoços Inseridos</span>
                        <span className="font-bold text-lg text-orange-400">{stats.artificialLunches}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <FileDown className="w-5 h-5" />
                        Baixar Tratada.xlsx
                    </button>
                    </div>

                    {/* Preview Table */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-slate-500" />
                            Pré-visualização dos Dados
                        </h2>
                        <ProcessedTable data={processedData} />
                    </div>
                </section>
                )}
            </div>
        )}

        {currentView === 'MERGER' && (
            <FileMerger onTransfer={handleFileTransfer} preloadedFile={preloadedFile} />
        )}

        {currentView === 'DAILY' && (
            <DailyWorkerAnalyzer preloadedFile={preloadedFile} />
        )}

        {currentView === 'SHIFT_ID' && (
            <ShiftIdentifier preloadedFile={preloadedFile} />
        )}

        {currentView === 'FILTER' && (
            <GroupFilter onTransfer={handleFileTransfer} />
        )}

        {currentView === 'INFO' && (
            <InformationAnalyzer onTransfer={handleFileTransfer} />
        )}

      </main>
    </div>
  );
};

export default App;