"use client"

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    FileSpreadsheet,
    Download,
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Loader2,
    Users,
    Dna,
    ArrowRight,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { cowsApi, type BulkImportResult } from '@/lib/api/cows';
import {
    downloadCattleExcelTemplate,
    parseCattleExcelFile,
    type ParsedImportRow,
} from '@/lib/excel-template';

interface ExcelImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ExcelImportDialog({ open, onOpenChange, onSuccess }: ExcelImportDialogProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<'upload' | 'guide'>('upload');
    const [isParsing, setIsParsing] = useState(false);
    const [fileName, setFileName] = useState('');
    const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
    const [summary, setSummary] = useState<{
        total: number;
        valid: number;
        invalid: number;
        bulls: number;
        cows: number;
        withMother: number;
        withSire: number;
        withAISire: number;
    } | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Reset state when closed
    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setFileName('');
            setParsedRows([]);
            setSummary(null);
            setImportResult(null);
            setErrorMessage(null);
            setIsSubmitting(false);
            setActiveTab('upload');
        }, 200);
    };

    // File selection & parsing
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsParsing(true);
            setErrorMessage(null);
            setFileName(file.name);
            setImportResult(null);

            const result = await parseCattleExcelFile(file);
            setParsedRows(result.rows);
            setSummary(result.summary);

            if (result.rows.length === 0) {
                setErrorMessage('No valid cattle data rows found in this sheet. Please verify the columns.');
            }
        } catch (err: any) {
            console.error('Failed to parse Excel file:', err);
            setErrorMessage(err?.message || 'Failed to read Excel file. Please ensure it is a valid .xlsx or .csv.');
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Submit import to API
    const handleImportSubmit = async () => {
        const validCows = parsedRows.filter((r) => r.isValid).map((r) => r.parsed);
        if (validCows.length === 0) {
            setErrorMessage('There are no valid cattle records to import.');
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);

            const result = await cowsApi.bulkImportCows(validCows);
            setImportResult(result);
            onSuccess(); // Refresh herd list in background
        } catch (err: any) {
            console.error('Bulk import error:', err);
            setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to import cattle records.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearFile = () => {
        setFileName('');
        setParsedRows([]);
        setSummary(null);
        setImportResult(null);
        setErrorMessage(null);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
                {/* Header */}
                <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    Bulk Import Cattle via Excel
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        + Pedigree Tree
                                    </span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Upload whole herds at once and automatically establish sire, dam, and family tree relationships.
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Download Template Button */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={downloadCattleExcelTemplate}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-bold border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download Excel Template
                        </Button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('upload')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                activeTab === 'upload'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            Upload & Preview
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('guide')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                activeTab === 'guide'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            Template & Field Guide
                        </button>
                    </div>
                </DialogHeader>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Error Alert */}
                    {errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="flex-1 font-medium">{errorMessage}</div>
                        </div>
                    )}

                    {/* SUCCESS STATE */}
                    {importResult ? (
                        <div className="py-6 space-y-6 text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    Cattle Import Completed!
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                    Your cattle records have been processed and your pedigree family tree has been updated.
                                </p>
                            </div>

                            {/* Result stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto text-left">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Created</span>
                                    <span className="text-xl font-black text-emerald-600">{importResult.createdCount}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Updated</span>
                                    <span className="text-xl font-black text-blue-600">{importResult.updatedCount}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Pedigree Links</span>
                                    <span className="text-xl font-black text-purple-600">{importResult.pedigreeLinkedCount}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Errors</span>
                                    <span className="text-xl font-black text-rose-600">{importResult.errorCount}</span>
                                </div>
                            </div>

                            {/* Warnings or Row errors if any */}
                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="text-left max-w-lg mx-auto p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                                    <p className="font-bold mb-1">Row Warnings:</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                        {importResult.errors.slice(0, 5).map((e, idx) => (
                                            <li key={idx}>Row {e.row} ({e.tagId || 'No Tag'}): {e.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={handleClose}
                                    className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
                                >
                                    Back to Herd
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        handleClose();
                                        router.push('/herd-management/family-tree');
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    View Family Tree
                                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        </div>
                    ) : activeTab === 'upload' ? (
                        <>
                            {/* Upload Dropzone */}
                            {!fileName ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-all"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                                        <UploadCloud className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            Click to browse or drag and drop your cattle spreadsheet
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Supports Microsoft Excel (.xlsx, .xls) and CSV files
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                        className="mt-2 text-xs font-semibold"
                                    >
                                        Select Spreadsheet
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Selected File Bar */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2.5">
                                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                            <div>
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                                    {fileName}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {parsedRows.length} rows detected
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearFile}
                                                className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Remove File
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Summary Stats Chips */}
                                    {summary && (
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                <span className="text-[10px] text-slate-400 block font-bold uppercase">Total</span>
                                                <span className="text-base font-black text-slate-800 dark:text-slate-100">{summary.total}</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-bold uppercase">Ready</span>
                                                <span className="text-base font-black text-emerald-700 dark:text-emerald-300">{summary.valid}</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                                                <span className="text-[10px] text-rose-700 dark:text-rose-300 block font-bold uppercase">Issues</span>
                                                <span className="text-base font-black text-rose-600">{summary.invalid}</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                                                <span className="text-[10px] text-blue-700 dark:text-blue-300 block font-bold uppercase">♀ / ♂</span>
                                                <span className="text-base font-black text-blue-700 dark:text-blue-300">{summary.cows} / {summary.bulls}</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                                                <span className="text-[10px] text-purple-700 dark:text-purple-300 block font-bold uppercase">Lineage Links</span>
                                                <span className="text-base font-black text-purple-700 dark:text-purple-300">{summary.withMother + summary.withSire + summary.withAISire}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview Table */}
                                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                        <div className="max-h-[300px] overflow-y-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <tr>
                                                        <th className="p-2.5 px-3">Status</th>
                                                        <th className="p-2.5 px-3">Tag ID</th>
                                                        <th className="p-2.5 px-3">Name</th>
                                                        <th className="p-2.5 px-3">Gender</th>
                                                        <th className="p-2.5 px-3">Breed</th>
                                                        <th className="p-2.5 px-3">DOB</th>
                                                        <th className="p-2.5 px-3">Mother Tag</th>
                                                        <th className="p-2.5 px-3">Sire / AI Reg</th>
                                                        <th className="p-2.5 px-3">Method</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                                    {parsedRows.map((item, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className={item.isValid ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-rose-50/50 dark:bg-rose-950/20'}
                                                        >
                                                            <td className="p-2.5 px-3 whitespace-nowrap">
                                                                {item.isValid ? (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        Valid
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600" title={item.errors.join(', ')}>
                                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                                        {item.errors[0]}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                                                {item.parsed.tagId}
                                                            </td>
                                                            <td className="p-2.5 px-3">{item.parsed.name || '—'}</td>
                                                            <td className="p-2.5 px-3">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                    item.parsed.gender === 'male'
                                                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                                                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                                                }`}>
                                                                    {item.parsed.gender === 'male' ? '♂ Male' : '♀ Female'}
                                                                </span>
                                                            </td>
                                                            <td className="p-2.5 px-3">{item.parsed.breed || '—'}</td>
                                                            <td className="p-2.5 px-3 font-mono">{item.parsed.dateOfBirth}</td>
                                                            <td className="p-2.5 px-3 font-semibold text-purple-700 dark:text-purple-300">
                                                                {item.parsed.motherTagId || '—'}
                                                            </td>
                                                            <td className="p-2.5 px-3 font-semibold">
                                                                {item.parsed.aiSireRegNo ? (
                                                                    <span className="text-purple-600 font-mono text-[11px]" title={item.parsed.aiSireName}>
                                                                        🧬 {item.parsed.aiSireRegNo}
                                                                    </span>
                                                                ) : item.parsed.sireTagId ? (
                                                                    <span className="text-blue-600">
                                                                        ♂ {item.parsed.sireTagId}
                                                                    </span>
                                                                ) : (
                                                                    '—'
                                                                )}
                                                            </td>
                                                            <td className="p-2.5 px-3 text-[11px] text-slate-500 font-medium">
                                                                {item.parsed.breedingMethod || '—'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* INSTRUCTIONS & FIELD GUIDE TAB */
                        <div className="space-y-4 text-xs">
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                                        Need a starting template?
                                    </h4>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                                        Download our official pre-filled Excel template with examples and column formats.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={downloadCattleExcelTemplate}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Template (.xlsx)
                                </Button>
                            </div>

                            <Card className="p-4 rounded-xl border-slate-200 dark:border-slate-800 space-y-3">
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Dna className="w-4 h-4 text-purple-600" />
                                    How Family Tree Connections Are Created Automatically
                                </h4>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    You do not need to look up system IDs! Simply reference the tag numbers you know:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 pl-1">
                                    <li>
                                        <strong className="text-slate-800 dark:text-slate-200">Mother (Dam):</strong> Put the mother cow's Tag ID (e.g. <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">COW-001</code>) in the <code className="font-bold text-purple-600">Mother Tag ID</code> column.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800 dark:text-slate-200">Natural Farm Sire:</strong> Put the farm bull's Tag ID in <code className="font-bold text-blue-600">Sire Tag ID (Natural)</code>.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800 dark:text-slate-200">AI / Semen Sire:</strong> If the calf was conceived via Artificial Insemination, enter the straw code or registration number in <code className="font-bold text-purple-600">AI Sire Reg No</code> (e.g. <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">AI-SEMEX-101</code>) and optionally the bull's name in <code className="font-bold">AI Sire Name</code>.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800 dark:text-slate-200">Order independence:</strong> Calves and parents can be listed in any order in the Excel file. The system processes them in two passes to link all generations.
                                    </li>
                                </ul>
                            </Card>

                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="p-2.5 px-3">Column Name</th>
                                            <th className="p-2.5 px-3">Required?</th>
                                            <th className="p-2.5 px-3">Description & Examples</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                                        <tr>
                                            <td className="p-2.5 px-3 font-bold text-slate-900 dark:text-white">Tag ID *</td>
                                            <td className="p-2.5 px-3 text-emerald-600 font-bold">YES</td>
                                            <td className="p-2.5 px-3">Unique ear tag (e.g. COW-001, BULL-01, G-102)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 px-3 font-bold text-slate-900 dark:text-white">Gender *</td>
                                            <td className="p-2.5 px-3 text-emerald-600 font-bold">YES</td>
                                            <td className="p-2.5 px-3">"Female" or "Male"</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 px-3 font-bold text-slate-900 dark:text-white">Date of Birth *</td>
                                            <td className="p-2.5 px-3 text-emerald-600 font-bold">YES</td>
                                            <td className="p-2.5 px-3">Birth date (YYYY-MM-DD format)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 px-3 font-bold text-slate-900 dark:text-white">Name</td>
                                            <td className="p-2.5 px-3 text-slate-400">Optional</td>
                                            <td className="p-2.5 px-3">Friendly cow name (e.g. Lakshmi, Gauri)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 px-3 font-bold text-slate-900 dark:text-white">Breed</td>
                                            <td className="p-2.5 px-3 text-slate-400">Optional</td>
                                            <td className="p-2.5 px-3">Gir, Sahiwal, Holstein, Jersey, etc.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 px-3 font-bold text-slate-900 dark:text-white">Mother Tag ID</td>
                                            <td className="p-2.5 px-3 text-slate-400">Optional</td>
                                            <td className="p-2.5 px-3">Tag ID of dam to build mother-calf tree</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 px-3 font-bold text-slate-900 dark:text-white">Sire Tag / AI Reg</td>
                                            <td className="p-2.5 px-3 text-slate-400">Optional</td>
                                            <td className="p-2.5 px-3">Sire bull tag or AI semen straw code</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {!importResult && (
                    <DialogFooter className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            {activeTab === 'guide' ? (
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('upload')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                >
                                    Proceed to Upload
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleImportSubmit}
                                    disabled={!summary || summary.valid === 0 || isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 px-5"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Importing Cattle & Linking Pedigree...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-4 h-4" />
                                            Import {summary?.valid ? `${summary.valid} Animals` : 'Cattle'}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
