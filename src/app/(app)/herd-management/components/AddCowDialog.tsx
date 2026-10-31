"use client"

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cowsApi, type CreateCowDto } from '@/lib/api/cows';
import type { Cow, ExternalBull } from '@/types';
import { Dna, Sparkles } from 'lucide-react';

interface AddCowDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    cow?: Cow | null;
}

export function AddCowDialog({ open, onOpenChange, onSuccess, cow }: AddCowDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [females, setFemales] = useState<{ id: string; tagId: string; name: string | null }[]>([]);
    const [males, setMales] = useState<{ id: string; tagId: string; name: string | null }[]>([]);
    const [extBulls, setExtBulls] = useState<ExternalBull[]>([]);

    const [formData, setFormData] = useState<CreateCowDto>({
        tagId: '',
        name: '',
        gender: 'female',
        breed: '',
        dateOfBirth: '',
        acquisitionDate: '',
        lifecycleStatus: 'active',
        acquisitionSource: 'Born on farm',
        bornOnFarm: true,
        motherId: '',
        sireId: '',
        externalSireId: '',
        breedingMethod: 'NATURAL',
    });

    // Fetch dropdown options when dialog opens
    useEffect(() => {
        if (!open) return;
        const fetchRelOptions = async () => {
            try {
                const [fData, mData, ebData] = await Promise.all([
                    cowsApi.getActiveFemales().catch(() => []),
                    cowsApi.getActiveMales().catch(() => []),
                    cowsApi.getExternalBulls().catch(() => []),
                ]);
                setFemales(fData);
                setMales(mData);
                setExtBulls(ebData);
            } catch (err) {
                console.error('Failed to load parent cattle options:', err);
            }
        };
        fetchRelOptions();
    }, [open]);

    // Populate form when cow prop changes (edit mode)
    useEffect(() => {
        if (cow) {
            setFormData({
                tagId: cow.tagId,
                name: cow.name || '',
                gender: cow.gender,
                breed: cow.breed,
                dateOfBirth: cow.dateOfBirth ? cow.dateOfBirth.split('T')[0] : '',
                acquisitionDate: cow.acquisitionDate ? cow.acquisitionDate.split('T')[0] : '',
                lifecycleStatus: cow.lifecycleStatus,
                acquisitionSource: cow.acquisitionSource || '',
                bornOnFarm: cow.bornOnFarm !== undefined ? cow.bornOnFarm : true,
                motherId: cow.motherId || '',
                sireId: cow.sireId || '',
                externalSireId: cow.externalSireId || '',
                breedingMethod: cow.breedingMethod || undefined,
            });
        } else {
            // Reset form when opening in create mode
            setFormData({
                tagId: '',
                name: '',
                gender: 'female',
                breed: '',
                dateOfBirth: '',
                acquisitionDate: new Date().toISOString().split('T')[0],
                lifecycleStatus: 'active',
                acquisitionSource: 'Born on farm',
                bornOnFarm: true,
                motherId: '',
                sireId: '',
                externalSireId: '',
                breedingMethod: 'NATURAL',
            });
        }
    }, [cow, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.tagId || !formData.breed || !formData.dateOfBirth || !formData.acquisitionDate) {
                setError('Please fill in all required fields (Tag ID, Breed, Date of Birth, Acquisition Date)');
                setIsSubmitting(false);
                return;
            }

            // Clean up optional fields
            const dataToSubmit: CreateCowDto = {
                tagId: formData.tagId.trim(),
                name: formData.name?.trim() || undefined,
                gender: formData.gender,
                breed: formData.breed.trim(),
                dateOfBirth: formData.dateOfBirth,
                acquisitionDate: formData.acquisitionDate,
                acquisitionSource: formData.acquisitionSource?.trim() || undefined,
                bornOnFarm: formData.bornOnFarm,
                motherId: formData.motherId ? formData.motherId : undefined,
                sireId: formData.breedingMethod === 'NATURAL' && formData.sireId ? formData.sireId : undefined,
                externalSireId: formData.breedingMethod === 'AI' && formData.externalSireId ? formData.externalSireId : undefined,
                breedingMethod: formData.breedingMethod || undefined,
            };

            if (cow) {
                await cowsApi.updateCow(cow.id, dataToSubmit);
            } else {
                await cowsApi.createCow(dataToSubmit);
            }

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Failed to save cow:', err);
            setError(err.response?.data?.message || 'Failed to save cow. Please check inputs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{cow ? 'Edit Cattle Profile' : 'Add New Cattle'}</DialogTitle>
                    <DialogDescription>
                        {cow ? 'Update profile and pedigree details' : 'Enter the cattle profile, breeding method, and sire/dam lineage'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Basic details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tagId">Tag ID *</Label>
                            <Input
                                id="tagId"
                                value={formData.tagId}
                                onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}
                                placeholder="e.g., GV-001"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name (Optional)</Label>
                            <Input
                                id="name"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Lakshmi"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, gender: value })}
                            >
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">Cow (Female)</SelectItem>
                                    <SelectItem value="male">Bull (Male)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="breed">Breed *</Label>
                            <Input
                                id="breed"
                                value={formData.breed}
                                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                placeholder="e.g., Gir, Holstein Friesian"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="acquisitionDate">Acquisition Date *</Label>
                            <Input
                                id="acquisitionDate"
                                type="date"
                                value={formData.acquisitionDate}
                                onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Origin / Born on farm */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Cattle Origin
                            </Label>
                            <div className="flex items-center gap-3 text-xs">
                                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                                    <input
                                        type="radio"
                                        name="bornOnFarm"
                                        checked={formData.bornOnFarm === true}
                                        onChange={() => setFormData({ 
                                            ...formData, 
                                            bornOnFarm: true,
                                            acquisitionSource: 'Born on farm'
                                        })}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                    />
                                    Born on Farm
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                                    <input
                                        type="radio"
                                        name="bornOnFarm"
                                        checked={formData.bornOnFarm === false}
                                        onChange={() => setFormData({ 
                                            ...formData, 
                                            bornOnFarm: false,
                                            acquisitionSource: 'Purchased'
                                        })}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                    />
                                    Purchased
                                </label>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="acquisitionSource" className="text-xs text-slate-400">
                                Acquisition Note / Source
                            </Label>
                            <Input
                                id="acquisitionSource"
                                value={formData.acquisitionSource || ''}
                                onChange={(e) => setFormData({ ...formData, acquisitionSource: e.target.value })}
                                placeholder="e.g., Born on farm, or Purchased from market"
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    {/* Pedigree & Lineage Tracking */}
                    <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                            <Dna className="w-4 h-4 text-emerald-600" />
                            Pedigree & Parentage
                        </div>

                        {/* Mother (Dam) */}
                        <div className="space-y-1.5">
                            <Label htmlFor="motherId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Dam / Mother Cow
                            </Label>
                            <select
                                id="motherId"
                                value={formData.motherId || ''}
                                onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                            >
                                <option value="">Unknown / None (Purchased root)</option>
                                {females
                                    .filter((f) => !cow || f.id !== cow.id)
                                    .map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name ? `${f.name} (${f.tagId})` : f.tagId}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Breeding Method */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Conception Method
                            </Label>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ 
                                        ...formData, 
                                        breedingMethod: 'NATURAL',
                                        externalSireId: '',
                                    })}
                                    className={`p-2 rounded-lg border font-bold text-center transition-all ${
                                        formData.breedingMethod === 'NATURAL'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    ♂ Natural Mating (Farm Bull)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ 
                                        ...formData, 
                                        breedingMethod: 'AI',
                                        sireId: '',
                                    })}
                                    className={`p-2 rounded-lg border font-bold text-center transition-all flex items-center justify-center gap-1 ${
                                        formData.breedingMethod === 'AI'
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    AI (Semen Straw)
                                </button>
                            </div>
                        </div>

                        {/* Sire selection depending on breeding method */}
                        {formData.breedingMethod === 'NATURAL' ? (
                            <div className="space-y-1.5">
                                <Label htmlFor="sireId" className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                    Sire (Father Bull on Farm)
                                </Label>
                                <select
                                    id="sireId"
                                    value={formData.sireId || ''}
                                    onChange={(e) => setFormData({ ...formData, sireId: e.target.value })}
                                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                                >
                                    <option value="">Unknown / None</option>
                                    {males
                                        .filter((m) => !cow || m.id !== cow.id)
                                        .map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name ? `${m.name} (${m.tagId})` : m.tagId}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        ) : formData.breedingMethod === 'AI' ? (
                            <div className="space-y-1.5">
                                <Label htmlFor="externalSireId" className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                    External AI Sire (Straw Bull)
                                </Label>
                                <select
                                    id="externalSireId"
                                    value={formData.externalSireId || ''}
                                    onChange={(e) => setFormData({ ...formData, externalSireId: e.target.value })}
                                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                                >
                                    <option value="">Unknown / None</option>
                                    {extBulls.map((eb) => (
                                        <option key={eb.id} value={eb.id}>
                                            {eb.name} ({eb.registrationNo}) {eb.source ? `• ${eb.source}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : null}
                    </div>

                    {error && (
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-800">
                            {error}
                        </p>
                    )}

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                            {isSubmitting ? (cow ? 'Saving...' : 'Adding...') : (cow ? 'Save Changes' : 'Add Cattle')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
