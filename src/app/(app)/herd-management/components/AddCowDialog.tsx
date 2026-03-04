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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cowsApi, type CreateCowDto } from '@/lib/api/cows';

interface AddCowDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddCowDialog({ open, onOpenChange, onSuccess }: AddCowDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<CreateCowDto>({
        tagId: '',
        name: '',
        gender: 'female',
        breed: '',
        dateOfBirth: '',
        acquisitionDate: '',
        lifecycleStatus: 'active',
        acquisitionSource: '',
        motherId: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.tagId || !formData.breed || !formData.dateOfBirth || !formData.acquisitionDate) {
                setError('Please fill in all required fields');
                setIsSubmitting(false);
                return;
            }

            // Clean up optional fields
            const { lifecycleStatus, ...restFormData } = formData;
            const dataToSubmit = {
                ...restFormData,
                name: formData.name || undefined,
                acquisitionSource: formData.acquisitionSource || undefined,
                motherId: formData.motherId || undefined,
            };

            await cowsApi.createCow(dataToSubmit);

            // Reset form
            setFormData({
                tagId: '',
                name: '',
                gender: 'female',
                breed: '',
                dateOfBirth: '',
                acquisitionDate: '',
                lifecycleStatus: 'active',
                acquisitionSource: '',
                motherId: '',
            });

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Failed to create cow:', err);
            setError(err.response?.data?.message || 'Failed to create cow. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Cow</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new cow to add to your herd.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tagId">Tag ID *</Label>
                        <Input
                            id="tagId"
                            value={formData.tagId}
                            onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}
                            placeholder="e.g., MH-001"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name (Optional)</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Gauri"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, gender: value })}>
                            <SelectTrigger id="gender">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
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

                    <div className="space-y-2">
                        <Label htmlFor="acquisitionSource">Acquisition Source (Optional)</Label>
                        <Input
                            id="acquisitionSource"
                            value={formData.acquisitionSource}
                            onChange={(e) => setFormData({ ...formData, acquisitionSource: e.target.value })}
                            placeholder="e.g., Local Breeder, Farm Auction"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="motherId">Mother ID (Optional)</Label>
                        <Input
                            id="motherId"
                            value={formData.motherId}
                            onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                            placeholder="e.g., cow-100"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Cow'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
