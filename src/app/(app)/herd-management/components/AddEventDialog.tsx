"use client"

import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cowEventsApi, type CreateCowEventDto } from '@/lib/api/cow-events';
import type { VaccinationMetadata, BreedingMetadata, HealthMetadata, FinancialMetadata } from '@/types';

interface AddEventDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cowId: string;
    onSuccess: () => void;
}

export function AddEventDialog({ open, onOpenChange, cowId, onSuccess }: AddEventDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [eventType, setEventType] = useState<'HEALTH' | 'VACCINATION' | 'BREEDING' | 'NOTE' | 'FINANCIAL'>('HEALTH');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');

    // Vaccination metadata
    const [vaccineName, setVaccineName] = useState('');
    const [nextDueDate, setNextDueDate] = useState('');

    // Breeding metadata
    const [sire, setSire] = useState('');
    const [method, setMethod] = useState<'AI' | 'Natural'>('AI');
    const [expectedCalvingDate, setExpectedCalvingDate] = useState('');

    // Health metadata
    const [symptoms, setSymptoms] = useState('');
    const [treatment, setTreatment] = useState('');
    const [diagnosis, setDiagnosis] = useState('');

    // Financial metadata
    const [salePrice, setSalePrice] = useState('');
    const [buyerName, setBuyerName] = useState('');

    const resetForm = () => {
        setEventType('HEALTH');
        setDate('');
        setDescription('');
        setVaccineName('');
        setNextDueDate('');
        setSire('');
        setMethod('AI');
        setExpectedCalvingDate('');
        setSymptoms('');
        setTreatment('');
        setDiagnosis('');
        setSalePrice('');
        setBuyerName('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (!date || !description) {
                setError('Please fill in all required fields');
                setIsSubmitting(false);
                return;
            }

            let metadata: any = undefined;

            switch (eventType) {
                case 'VACCINATION':
                    if (!vaccineName) {
                        setError('Vaccine name is required for vaccination events');
                        setIsSubmitting(false);
                        return;
                    }
                    metadata = {
                        vaccineName,
                        ...(nextDueDate && { nextDueDate }),
                    } as VaccinationMetadata;
                    break;

                case 'BREEDING':
                    if (!sire) {
                        setError('Sire is required for breeding events');
                        setIsSubmitting(false);
                        return;
                    }
                    metadata = {
                        sire,
                        method,
                        ...(expectedCalvingDate && { expectedCalvingDate }),
                    } as BreedingMetadata;
                    break;

                case 'HEALTH':
                    if (!treatment || !diagnosis) {
                        setError('Treatment and diagnosis are required for health events');
                        setIsSubmitting(false);
                        return;
                    }
                    metadata = {
                        symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
                        treatment,
                        diagnosis,
                    } as HealthMetadata;
                    break;

                case 'FINANCIAL':
                    metadata = {
                        ...(salePrice && { salePrice: parseFloat(salePrice) }),
                        ...(buyerName && { buyerName }),
                    } as FinancialMetadata;
                    break;
            }

            const eventData: CreateCowEventDto = {
                type: eventType,
                date,
                description,
                ...(metadata && { metadata }),
            };

            await cowEventsApi.createCowEvent(cowId, eventData);

            resetForm();
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Failed to create event:', err);
            setError(err.response?.data?.message || 'Failed to create event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                        Record a new event in this cow's timeline.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="eventType">Event Type *</Label>
                        <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                            <SelectTrigger id="eventType">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HEALTH">Health</SelectItem>
                                <SelectItem value="VACCINATION">Vaccination</SelectItem>
                                <SelectItem value="BREEDING">Breeding</SelectItem>
                                <SelectItem value="NOTE">Note</SelectItem>
                                <SelectItem value="FINANCIAL">Financial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the event..."
                            required
                        />
                    </div>

                    {/* Vaccination-specific fields */}
                    {eventType === 'VACCINATION' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="vaccineName">Vaccine Name *</Label>
                                <Input
                                    id="vaccineName"
                                    value={vaccineName}
                                    onChange={(e) => setVaccineName(e.target.value)}
                                    placeholder="e.g., FMD Prevent"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nextDueDate">Next Due Date (Optional)</Label>
                                <Input
                                    id="nextDueDate"
                                    type="date"
                                    value={nextDueDate}
                                    onChange={(e) => setNextDueDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Breeding-specific fields */}
                    {eventType === 'BREEDING' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="sire">Sire *</Label>
                                <Input
                                    id="sire"
                                    value={sire}
                                    onChange={(e) => setSire(e.target.value)}
                                    placeholder="e.g., Bull Alpha"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="method">Method *</Label>
                                <Select value={method} onValueChange={(value: 'AI' | 'Natural') => setMethod(value)}>
                                    <SelectTrigger id="method">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AI">Artificial Insemination (AI)</SelectItem>
                                        <SelectItem value="Natural">Natural</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expectedCalvingDate">Expected Calving Date (Optional)</Label>
                                <Input
                                    id="expectedCalvingDate"
                                    type="date"
                                    value={expectedCalvingDate}
                                    onChange={(e) => setExpectedCalvingDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Health-specific fields */}
                    {eventType === 'HEALTH' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="symptoms">Symptoms (comma-separated)</Label>
                                <Input
                                    id="symptoms"
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="e.g., fever, lameness"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="treatment">Treatment *</Label>
                                <Input
                                    id="treatment"
                                    value={treatment}
                                    onChange={(e) => setTreatment(e.target.value)}
                                    placeholder="e.g., Antibiotics"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="diagnosis">Diagnosis *</Label>
                                <Input
                                    id="diagnosis"
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    placeholder="e.g., Minor infection"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Financial-specific fields */}
                    {eventType === 'FINANCIAL' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="salePrice">Sale Price (Optional)</Label>
                                <Input
                                    id="salePrice"
                                    type="number"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value)}
                                    placeholder="e.g., 75000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="buyerName">Buyer Name (Optional)</Label>
                                <Input
                                    id="buyerName"
                                    value={buyerName}
                                    onChange={(e) => setBuyerName(e.target.value)}
                                    placeholder="e.g., Buyer X"
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
