import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Trash2,
  FileText,
  Printer,
  Check,
  Tag,
  Plus,
  ArrowRight,
  Calculator,
  ListCollapse,
  LayoutList,
} from 'lucide-react';
import type { HistoryItem, CalculatorTheme, CalculatorSettings } from '@/types/calculator';
import { getCornerRadiusClasses } from '@/lib/cornerRadius';
import { toast } from 'sonner';

interface AccountantPaperTapeProps {
  history: HistoryItem[];
  onRecall: (item: HistoryItem, useResultOnly?: boolean) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onUpdateNote: (id: string, note: string) => void;
  onExport: (format: 'text' | 'csv' | 'json') => string;
  theme: CalculatorTheme;
  settings?: CalculatorSettings;
  onClose?: () => void;
}

export const AccountantPaperTape: React.FC<AccountantPaperTapeProps> = ({
  history,
  onRecall,
  onDelete,
  onClear,
  onUpdateNote,
  onExport,
  theme,
  settings,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const cornerClasses = getCornerRadiusClasses(settings?.cornerRadius || 'extra');
  const isNordic = theme.id === 'nordic-light';

  // Chronological order from oldest to newest (like an adding machine tape running downwards)
  const tapeItems = [...history].reverse();

  // Auto-scroll to bottom when new calculation cards move downward on the paper tape roll
  const prevItemsLenRef = useRef(tapeItems.length);
  useEffect(() => {
    if (tapeItems.length > prevItemsLenRef.current) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    prevItemsLenRef.current = tapeItems.length;
  }, [tapeItems.length]);

  // Calculate sum of numeric results
  const runningSum = tapeItems.reduce((acc, item) => {
    const num = parseFloat(item.result.replace(/,/g, ''));
    return isNaN(num) ? acc : acc + num;
  }, 0);

  const handleStartEditNote = (item: HistoryItem) => {
    setEditingId(item.id);
    setTempNote(item.note || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateNote(id, tempNote.trim());
    setEditingId(null);
    toast.success('Annotation updated');
  };

  const handleCopyItem = (item: HistoryItem) => {
    const text = `${item.runningEquation || item.expression} = ${item.result}${
      item.note ? ` [${item.note}]` : ''
    }`;
    navigator.clipboard.writeText(text);
    setCopiedItemId(item.id);
    toast.success('Copied line item');
    setTimeout(() => setCopiedItemId(null), 1200);
  };

  const handleCopyFullTape = () => {
    if (tapeItems.length === 0) return;
    const header = `========================================\n       DOCKCALC AUDIT PAPER TAPE       \n       Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} \n========================================\n\n`;
    const lines = tapeItems
      .map((item, idx) => {
        const lineNum = String(idx + 1).padStart(3, '0');
        const eq = item.runningEquation || item.expression;
        const noteStr = item.note ? `\n     # Memo: ${item.note}` : '';
        return `[${lineNum}]  ${eq}\n       = ${item.result}${noteStr}`;
      })
      .join('\n----------------------------------------\n');
    const footer = `\n========================================\nTOTAL ENTRIES: ${tapeItems.length}\nTAPE RUNNING SUM: ${runningSum.toLocaleString(undefined, { maximumFractionDigits: 6 })}\n========================================\n`;

    const fullTape = header + lines + footer;
    navigator.clipboard.writeText(fullTape);
    setCopiedAll(true);
    toast.success('Copied full annotated paper tape to clipboard');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (tapeItems.length === 0) {
      toast.warning('Paper tape is empty');
      return;
    }
    const header = `====================================================\n             DOCKCALC ACCOUNTANT PAPER TAPE         \n             Printed: ${new Date().toLocaleString()} \n====================================================\n\n`;
    const lines = tapeItems
      .map((item, idx) => {
        const lineNum = String(idx + 1).padStart(3, '0');
        const time = new Date(item.timestamp).toLocaleTimeString();
        const eq = item.runningEquation || item.expression;
        const note = item.note ? ` [Note: ${item.note}]` : '';
        return `[${lineNum}] ${time.padEnd(11)} ${eq.padEnd(25)} = ${item.result}${note}`;
      })
      .join('\n');
    const footer = `\n\n----------------------------------------------------\nTotal Line Items: ${tapeItems.length}\nAudit Running Sum: ${runningSum.toLocaleString(undefined, { maximumFractionDigits: 6 })}\n====================================================\n`;

    const blob = new Blob([header + lines + footer], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dockcalc-paper-tape-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded Paper Tape (.txt)');
  };

  const handleDownloadCsv = () => {
    if (tapeItems.length === 0) {
      toast.warning('Paper tape is empty');
      return;
    }
    const csvContent = onExport('csv');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dockcalc-audit-tape-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded Audit Log (.csv)');
  };

  const handlePrint = () => {
    if (tapeItems.length === 0) {
      toast.warning('Paper tape is empty');
      return;
    }
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      toast.error('Pop-up blocked for printing');
      return;
    }
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dockcalc Paper Tape</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 24px; color: #111; max-width: 380px; margin: 0 auto; }
            h2 { text-align: center; margin: 0 0 6px 0; font-size: 16px; border-bottom: 2px dashed #333; padding-bottom: 8px; }
            .date { text-align: center; font-size: 11px; margin-bottom: 16px; color: #555; }
            .line-item { margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dotted #ccc; }
            .eq { font-weight: bold; font-size: 13px; }
            .res { text-align: right; font-size: 14px; font-weight: bold; }
            .note { font-style: italic; font-size: 11px; color: #444; margin-top: 2px; }
            .summary { margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>DOCKCALC AUDIT TAPE</h2>
          <div class="date">${new Date().toLocaleString()}</div>
          ${tapeItems
            .map(
              (item, idx) => `
            <div class="line-item">
              <div>#${idx + 1} (${new Date(item.timestamp).toLocaleTimeString()})</div>
              <div class="eq">${item.runningEquation || item.expression}</div>
              <div class="res">= ${item.result}</div>
              ${item.note ? `<div class="note">Memo: ${item.note}</div>` : ''}
            </div>
          `
            )
            .join('')}
          <div class="summary">
            <div>TOTAL ITEMS: ${tapeItems.length}</div>
            <div style="font-size: 15px; margin-top: 4px;">RUNNING SUM: ${runningSum.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div
      className={`h-full flex flex-col ${cornerClasses.card} ${
        isNordic
          ? 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A]'
          : 'bg-[#121620] border border-white/10 text-white'
      } shadow-md overflow-hidden font-mono text-xs`}
    >
      {/* TAPE TOP BAR & ACTIONS */}
      <div
        className={`px-3 py-2 border-b shrink-0 flex items-center justify-between select-none ${
          isNordic
            ? 'bg-[#E2E8F0]/80 border-[#CBD5E1]'
            : 'bg-[#181D2A] border-white/10'
        }`}
      >
        {/* Left: Paper Tape Symbol */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary" title="Paper Tape Roll">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {/* Right: Function & Action Symbols */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsCompact((v) => !v)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isCompact
                ? 'bg-primary/20 text-primary border-primary/40 font-bold'
                : 'border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title={isCompact ? 'Expand to Detailed View' : 'Collapse into Single-Line View'}
          >
            {isCompact ? <LayoutList className="w-3.5 h-3.5" /> : <ListCollapse className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleCopyFullTape}
            disabled={tapeItems.length === 0}
            className="p-1.5 rounded-lg border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
            title="Copy Full Tape Text"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDownloadTxt}
            disabled={tapeItems.length === 0}
            className="p-1.5 rounded-lg border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
            title="Export as Text Tape (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={tapeItems.length === 0}
            className="px-2 py-1 rounded-lg border border-border/50 hover:bg-muted text-[10px] font-sans font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
            title="Export Spreadsheet (.csv)"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={tapeItems.length === 0}
            className="p-1.5 rounded-lg border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
            title="Print Tape Receipt"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={tapeItems.length === 0}
            className="p-1.5 rounded-lg border border-destructive/30 hover:bg-destructive/10 text-destructive transition-colors cursor-pointer disabled:opacity-40"
            title="Clear Paper Tape"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CONTINUOUS ROLLER PAPER RECEIPT CONTAINER - Automatically scrolls when cards reach bottom */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 relative select-text overscroll-contain"
      >
        {tapeItems.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
            <Calculator className="w-8 h-8 opacity-30 stroke-1" />
            <div className="font-semibold text-xs">Paper Tape is Empty</div>
            <div className="text-[11px] max-w-[220px] leading-relaxed">
              Calculate numbers to print line entries on this accountant audit strip. Add line memos and export logs.
            </div>
          </div>
        ) : (
          <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
            {tapeItems.map((item, index) => {
              const lineNo = String(index + 1).padStart(3, '0');
              const isEditing = editingId === item.id;

              if (isCompact) {
                return (
                  <div
                    key={item.id}
                    className={`px-2 py-1.5 rounded-md border text-xs transition-all flex items-center justify-between gap-1.5 ${
                      isNordic
                        ? 'bg-white border-[#CBD5E1] shadow-2xs hover:border-primary/60'
                        : 'bg-[#181D29]/90 border-white/10 shadow-2xs hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                      <span className="font-bold text-primary font-mono text-[10px] shrink-0">
                        #{lineNo}
                      </span>
                      <span
                        onClick={() => onRecall(item)}
                        className="font-mono text-muted-foreground truncate cursor-pointer hover:text-foreground shrink-1"
                        title="Click to recall into calculator"
                      >
                        {item.runningEquation || item.expression}
                      </span>
                      <span className="font-mono font-bold text-foreground shrink-0 flex items-center gap-0.5">
                        <ArrowRight className="w-2.5 h-2.5 text-primary opacity-70" />
                        <span>{item.result}</span>
                      </span>

                      {/* Line Annotation inline */}
                      {isEditing ? (
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <input
                            type="text"
                            value={tempNote}
                            autoFocus
                            placeholder="Memo..."
                            onChange={(e) => setTempNote(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNote(item.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="w-24 px-1.5 py-0.2 rounded border border-primary bg-background text-[11px] font-sans text-foreground focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNote(item.id)}
                            className="px-1.5 py-0.2 rounded bg-primary text-primary-foreground text-[9px] font-sans font-semibold cursor-pointer"
                          >
                            OK
                          </button>
                        </div>
                      ) : item.note ? (
                        <span
                          onClick={() => handleStartEditNote(item)}
                          className="text-[10px] px-1 py-0.2 rounded bg-primary/10 text-primary truncate max-w-[90px] cursor-pointer hover:bg-primary/20 shrink-0 font-sans"
                          title={`Memo: ${item.note} (Click to edit)`}
                        >
                          [{item.note}]
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {!item.note && !isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEditNote(item)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground cursor-pointer"
                          title="Add Memo"
                        >
                          <Tag className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyItem(item)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy Line"
                      >
                        {copiedItemId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete Line"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isNordic
                      ? 'bg-white border-[#CBD5E1] shadow-xs hover:border-primary/60'
                      : 'bg-[#181D29]/90 border-white/10 shadow-xs hover:border-primary/50'
                  }`}
                >
                  {/* Line Header: Number, Time & Actions */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1 border-b border-border/30">
                    <span className="font-bold text-primary font-mono">#{lineNo}</span>
                    <span className="font-mono opacity-80">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyItem(item)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy Line"
                      >
                        {copiedItemId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete Line"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Line Equation & Result */}
                  <div
                    onClick={() => onRecall(item)}
                    className="py-1 cursor-pointer hover:opacity-90 flex flex-col gap-0.5"
                    title="Click to recall into calculator"
                  >
                    <div className="text-[11px] text-muted-foreground break-all font-mono">
                      {item.runningEquation || item.expression}
                    </div>
                    <div className="text-right text-sm font-bold text-foreground font-mono flex items-center justify-end gap-1">
                      <ArrowRight className="w-3 h-3 text-primary shrink-0 opacity-70" />
                      <span>= {item.result}</span>
                    </div>
                  </div>

                  {/* Inline Editable Annotation / Memo */}
                  <div className="pt-1.5 border-t border-border/20 flex items-center gap-1.5 text-[11px]">
                    <Tag className="w-3 h-3 text-primary/70 shrink-0" />
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={tempNote}
                          autoFocus
                          placeholder="e.g. Tax, Groceries, Travel..."
                          onChange={(e) => setTempNote(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveNote(item.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="flex-1 px-2 py-0.5 rounded border border-primary bg-background text-xs font-sans text-foreground focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNote(item.id)}
                          className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-sans font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartEditNote(item)}
                        className="flex-1 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-between group font-sans"
                        title="Click to edit line annotation"
                      >
                        {item.note ? (
                          <span className="text-foreground font-medium text-xs break-all bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {item.note}
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-60 italic flex items-center gap-1">
                            <Plus className="w-2.5 h-2.5" /> Add line memo...
                          </span>
                        )}
                        <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Edit
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAPER TAPE FOOTER: RUNNING TOTAL STATS */}
      <div
        className={`px-3.5 py-2.5 border-t shrink-0 flex items-center justify-between ${
          isNordic
            ? 'bg-[#E2E8F0] border-[#CBD5E1]'
            : 'bg-[#181D2A] border-white/10'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Audit Running Sum
          </span>
          <span className="text-sm font-extrabold text-primary font-mono">
            {runningSum.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </span>
        </div>
        <div className="text-right text-[10px] text-muted-foreground">
          <div>Entries: <span className="font-bold text-foreground">{tapeItems.length}</span></div>
          <div>Audit Roll Mode</div>
        </div>
      </div>
    </div>
  );
};
