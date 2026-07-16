import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  Loader2, 
  FileSearch, 
  Sparkles, 
  Brain, 
  CheckCircle2,
  Layers,
  Network,
  MessageSquare,
  Zap
} from 'lucide-react';
import { useStore } from '../store';

export function UploadZone({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const addDocument = useStore((s) => s.addDocument);
  const openDocument = useStore((s) => s.openDocument);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Processing pipeline steps
  const steps = [
    { id: 0, icon: UploadCloud, label: 'Uploading', desc: 'Transferring document', color: 'blue' },
    { id: 1, icon: FileSearch, label: 'Extracting', desc: 'Reading text & layout', color: 'violet' },
    { id: 2, icon: Brain, label: 'Embedding', desc: 'Creating AI vectors', color: 'emerald' },
    { id: 3, icon: Sparkles, label: 'Analyzing', desc: 'Generating summary', color: 'amber' },
    { id: 4, icon: Layers, label: 'Flashcards', desc: 'Creating study cards', color: 'crimson' },
    { id: 5, icon: Network, label: 'Graph', desc: 'Building knowledge map', color: 'blue' },
    { id: 6, icon: CheckCircle2, label: 'Ready', desc: 'Workspace prepared', color: 'emerald' },
  ];

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      // Client-side file type check
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Invalid file type. Only PDF files are allowed.');
        return;
      }

      // Client-side file size check (25MB limit)
      const maxLimit = 25 * 1024 * 1024;
      if (file.size > maxLimit) {
        alert('File is too large. Maximum allowed size is 25MB.');
        return;
      }

      setFileName(file.name);
      setUploading(true);
      setUploadProgress(0);
      setCurrentStep(0);

      // Simulate pipeline with realistic timing
      const stepDurations = [600, 800, 1000, 900, 700, 600, 400]; // ms per step
      let elapsed = 0;

      const advanceStep = (stepIndex: number) => {
        if (stepIndex >= steps.length) return;
        
        setCurrentStep(stepIndex);
        setUploadProgress(Math.round((stepIndex / (steps.length - 1)) * 100));

        if (stepIndex < steps.length - 1) {
          elapsed += stepDurations[stepIndex];
          setTimeout(() => advanceStep(stepIndex + 1), stepDurations[stepIndex]);
        } else {
          // Final step: complete and navigate
          setTimeout(() => {
            const sizeMB = file.size / (1024 * 1024) || 2.4;
            const id = addDocument(file.name.replace(/\.pdf$/i, ''), sizeMB, file);
            setUploading(false);
            setCurrentStep(0);
            setUploadProgress(0);
            openDocument(id);
            navigate('/app/workspace');
          }, 500);
        }
      };

      advanceStep(0);
    },
    [addDocument, openDocument, navigate, steps.length]
  );


  if (compact) {
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-ink-200 px-3 py-2 text-xs text-ink-400 transition-colors hover:border-crimson-300 hover:text-crimson-600"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
        {uploading ? 'Uploading...' : 'Upload PDF'}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`
        relative flex flex-col items-center justify-center rounded-xl2 border-2 border-dashed
        transition-all duration-300
        ${dragging ? 'border-crimson-400 bg-crimson-50/50 scale-[1.01]' : 'border-ink-200 bg-paper-50/50'}
        ${compact ? 'p-6' : 'p-12'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <AnimatePresence mode="wait">
        {uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-6 py-6 w-full max-w-md"
          >
            {/* Document Name */}
            <div className="flex items-center gap-3 rounded-xl border-2 border-ink-200/60 bg-gradient-to-br from-paper-50 to-paper-100 px-4 py-3 shadow-soft w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crimson-500 text-white">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-800 truncate">{fileName}</p>
                <p className="text-xs text-ink-500">Processing document...</p>
              </div>
            </div>

            {/* Pipeline Visualization */}
            <div className="w-full space-y-3">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isPending = currentStep < step.id;
                
                const colors = {
                  blue: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', border: 'border-blue-500' },
                  violet: { bg: 'from-violet-500 to-violet-600', text: 'text-violet-600', border: 'border-violet-500' },
                  emerald: { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-500' },
                  amber: { bg: 'from-amber-500 to-amber-600', text: 'text-amber-600', border: 'border-amber-500' },
                  crimson: { bg: 'from-crimson-500 to-crimson-600', text: 'text-crimson-600', border: 'border-crimson-500' },
                };
                
                const colorScheme = colors[step.color as keyof typeof colors];

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
                      isActive
                        ? `${colorScheme.border} bg-gradient-to-r from-${step.color}-50 to-${step.color}-100/50 shadow-soft`
                        : isCompleted
                        ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/30'
                        : 'border-ink-100 bg-paper-50 opacity-50'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                        isActive
                          ? `bg-gradient-to-br ${colorScheme.bg} text-white shadow-float`
                          : isCompleted
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                          : 'bg-ink-100 text-ink-400'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Icon size={20} />
                        </motion.div>
                      )}
                      {!isActive && <Icon size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${
                        isActive || isCompleted ? 'text-ink-800' : 'text-ink-500'
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-ink-500 truncate">{step.desc}</p>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-6 w-6 items-center justify-center"
                      >
                        <Loader2 size={16} className={`animate-spin ${colorScheme.text}`} />
                      </motion.div>
                    )}
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-700">Overall Progress</span>
                <span className="font-bold text-crimson-600">{uploadProgress}%</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-ink-100 shadow-inset">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-crimson-500 to-crimson-400"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center gap-2 rounded-lg border border-ink-200/60 bg-paper-100 px-3 py-2">
              <Zap size={14} className="text-amber-600" />
              <span className="text-xs text-ink-600">
                Estimated time: <span className="font-semibold">~{Math.max(1, 7 - currentStep)} seconds</span>
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <motion.div
              animate={dragging ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-500 to-crimson-600 text-white shadow-float"
            >
              <UploadCloud size={36} strokeWidth={2} />
            </motion.div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-ink-900">
                Upload Your Document
              </h3>
              <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-sm mx-auto">
                Drag and drop a PDF here, or click to browse
              </p>
            </div>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { icon: Brain, text: 'AI Analysis' },
                { icon: MessageSquare, text: 'Smart Chat' },
                { icon: Layers, text: 'Flashcards' },
                { icon: Network, text: 'Knowledge Graph' },
              ].map((feature) => (
                <span key={feature.text} className="chip chip-secondary gap-1.5">
                  <feature.icon size={12} />
                  {feature.text}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="btn-primary gap-2"
              >
                <FileText size={18} /> Choose File
              </button>
            </div>
            <p className="text-xs text-ink-400">
              PDF up to <span className="font-semibold">25 MB</span> · Processed in{' '}
              <span className="font-semibold">~10 seconds</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
