import * as XLSX from 'xlsx';
import type { BulkImportCowRow } from './api/cows';

export interface ParsedImportRow {
    rowNumber: number;
    raw: Record<string, unknown>;
    parsed: BulkImportCowRow;
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Convert Excel date serial number or standard date string to YYYY-MM-DD
 */
export function formatExcelDate(value: unknown): string {
    if (!value) return '';
    if (value instanceof Date && !isNaN(value.getTime())) {
        return value.toISOString().split('T')[0];
    }
    if (typeof value === 'number') {
        // Excel base date: Dec 30, 1899
        const date = new Date(Math.round((value - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }
    const str = String(value).trim();
    // Check if already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
    }
    // Try DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (ddmmyyyy) {
        const day = ddmmyyyy[1].padStart(2, '0');
        const month = ddmmyyyy[2].padStart(2, '0');
        const year = ddmmyyyy[3];
        return `${year}-${month}-${day}`;
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }
    return str;
}

/**
 * Generate and trigger download of pre-formatted Excel template
 */
export function downloadCattleExcelTemplate() {
    const workbook = XLSX.utils.book_new();

    // 1. Main Data Sheet
    const headers = [
        'Tag ID *',
        'Name',
        'Gender *',
        'Breed',
        'Date of Birth *',
        'Mother Tag ID',
        'Breeding Method',
        'Sire Tag ID (Natural)',
        'AI Sire Reg No',
        'AI Sire Name',
        'AI Sire Breed',
        'Born on Farm',
        'Acquisition Date',
        'Acquisition Source',
        'Acquisition Cost',
        'Lifecycle Status',
    ];

    const sampleRows = [
        {
            'Tag ID *': 'COW-001',
            'Name': 'Gauri',
            'Gender *': 'Female',
            'Breed': 'Gir',
            'Date of Birth *': '2020-01-15',
            'Mother Tag ID': '',
            'Breeding Method': '',
            'Sire Tag ID (Natural)': '',
            'AI Sire Reg No': '',
            'AI Sire Name': '',
            'AI Sire Breed': '',
            'Born on Farm': 'Yes',
            'Acquisition Date': '2020-01-15',
            'Acquisition Source': 'Born on farm',
            'Acquisition Cost': 0,
            'Lifecycle Status': 'Active',
        },
        {
            'Tag ID *': 'BULL-001',
            'Name': 'Nandi',
            'Gender *': 'Male',
            'Breed': 'Gir',
            'Date of Birth *': '2019-05-10',
            'Mother Tag ID': '',
            'Breeding Method': '',
            'Sire Tag ID (Natural)': '',
            'AI Sire Reg No': '',
            'AI Sire Name': '',
            'AI Sire Breed': '',
            'Born on Farm': 'No',
            'Acquisition Date': '2020-03-01',
            'Acquisition Source': 'Purchased from breeding farm',
            'Acquisition Cost': 55000,
            'Lifecycle Status': 'Active',
        },
        {
            'Tag ID *': 'COW-002',
            'Name': 'Kaveri',
            'Gender *': 'Female',
            'Breed': 'Gir',
            'Date of Birth *': '2022-03-20',
            'Mother Tag ID': 'COW-001',
            'Breeding Method': 'NATURAL',
            'Sire Tag ID (Natural)': 'BULL-001',
            'AI Sire Reg No': '',
            'AI Sire Name': '',
            'AI Sire Breed': '',
            'Born on Farm': 'Yes',
            'Acquisition Date': '2022-03-20',
            'Acquisition Source': 'Born on farm',
            'Acquisition Cost': 0,
            'Lifecycle Status': 'Active',
        },
        {
            'Tag ID *': 'COW-003',
            'Name': 'Ganga',
            'Gender *': 'Female',
            'Breed': 'Gir Cross',
            'Date of Birth *': '2023-10-05',
            'Mother Tag ID': 'COW-001',
            'Breeding Method': 'AI',
            'Sire Tag ID (Natural)': '',
            'AI Sire Reg No': 'AI-SEMEX-101',
            'AI Sire Name': 'Semex Commander',
            'AI Sire Breed': 'Holstein Friesian',
            'Born on Farm': 'Yes',
            'Acquisition Date': '2023-10-05',
            'Acquisition Source': 'Born on farm',
            'Acquisition Cost': 0,
            'Lifecycle Status': 'Active',
        },
        {
            'Tag ID *': 'COW-004',
            'Name': 'Radha',
            'Gender *': 'Female',
            'Breed': 'Jersey',
            'Date of Birth *': '2021-08-12',
            'Mother Tag ID': '',
            'Breeding Method': '',
            'Sire Tag ID (Natural)': '',
            'AI Sire Reg No': '',
            'AI Sire Name': '',
            'AI Sire Breed': '',
            'Born on Farm': 'No',
            'Acquisition Date': '2022-01-10',
            'Acquisition Source': 'Purchased',
            'Acquisition Cost': 60000,
            'Lifecycle Status': 'Active',
        },
    ];

    const dataSheet = XLSX.utils.json_to_sheet(sampleRows, { header: headers });

    // Set column widths for readability
    dataSheet['!cols'] = [
        { wch: 14 }, // Tag ID
        { wch: 16 }, // Name
        { wch: 12 }, // Gender
        { wch: 16 }, // Breed
        { wch: 16 }, // Date of Birth
        { wch: 16 }, // Mother Tag ID
        { wch: 18 }, // Breeding Method
        { wch: 22 }, // Sire Tag ID (Natural)
        { wch: 18 }, // AI Sire Reg No
        { wch: 20 }, // AI Sire Name
        { wch: 18 }, // AI Sire Breed
        { wch: 14 }, // Born on Farm
        { wch: 16 }, // Acquisition Date
        { wch: 22 }, // Acquisition Source
        { wch: 16 }, // Acquisition Cost
        { wch: 16 }, // Lifecycle Status
    ];

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Cattle Data');

    // 2. Instructions Sheet
    const instructionsData = [
        { 'Column Header': 'Tag ID *', 'Required?': 'YES', 'Description': 'Unique ear tag or ID for the animal on your farm (e.g., COW-001, G-102).' },
        { 'Column Header': 'Name', 'Required?': 'No', 'Description': 'Friendly name of the cow or bull (e.g., Lakshmi, Daisy).' },
        { 'Column Header': 'Gender *', 'Required?': 'YES', 'Description': 'Must be "Female" or "Male".' },
        { 'Column Header': 'Breed', 'Required?': 'No', 'Description': 'Breed name (e.g., Gir, Sahiwal, Holstein Friesian, Jersey, Murrah).' },
        { 'Column Header': 'Date of Birth *', 'Required?': 'YES', 'Description': 'Birth date in YYYY-MM-DD or standard date format.' },
        { 'Column Header': 'Mother Tag ID', 'Required?': 'No', 'Description': 'Tag ID of the mother cow (Dam) on your farm. Connects family tree automatically.' },
        { 'Column Header': 'Breeding Method', 'Required?': 'No', 'Description': 'Either "NATURAL" (farm bull) or "AI" (Artificial Insemination).' },
        { 'Column Header': 'Sire Tag ID (Natural)', 'Required?': 'No', 'Description': 'Tag ID of the natural farm sire bull. Used when Breeding Method is NATURAL.' },
        { 'Column Header': 'AI Sire Reg No', 'Required?': 'No', 'Description': 'Semen straw code or NAAB registration # (e.g., 029HO18290, AI-SEMEX-101) when AI is used.' },
        { 'Column Header': 'AI Sire Name', 'Required?': 'No', 'Description': 'Name of the AI bull / semen provider (e.g., Semex Commander).' },
        { 'Column Header': 'AI Sire Breed', 'Required?': 'No', 'Description': 'Breed of the AI semen bull.' },
        { 'Column Header': 'Born on Farm', 'Required?': 'No', 'Description': '"Yes" if born on farm, "No" if purchased. Defaults to Yes.' },
        { 'Column Header': 'Acquisition Date', 'Required?': 'No', 'Description': 'Date acquired (defaults to Date of Birth if born on farm).' },
        { 'Column Header': 'Acquisition Source', 'Required?': 'No', 'Description': 'Where the animal was sourced from (e.g., Born on farm, ABC Auction, Local Market).' },
        { 'Column Header': 'Acquisition Cost', 'Required?': 'No', 'Description': 'Purchase cost in rupees/currency if bought.' },
        { 'Column Header': 'Lifecycle Status', 'Required?': 'No', 'Description': '"Active", "Sold", or "Deceased". Defaults to Active.' },
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
        { wch: 24 },
        { wch: 12 },
        { wch: 80 },
    ];

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Field Guide & Help');

    // Download file
    XLSX.writeFile(workbook, 'MyCowFarm_Cattle_Import_Template.xlsx');
}

/**
 * Parse an uploaded Excel or CSV file into validated cattle records
 */
export async function parseCattleExcelFile(file: File): Promise<{
    rows: ParsedImportRow[];
    summary: {
        total: number;
        valid: number;
        invalid: number;
        bulls: number;
        cows: number;
        withMother: number;
        withSire: number;
        withAISire: number;
    };
}> {
    const dataBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(dataBuffer, { type: 'array', cellDates: true });

    // Use first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const rows: ParsedImportRow[] = [];
    let bulls = 0;
    let cows = 0;
    let withMother = 0;
    let withSire = 0;
    let withAISire = 0;

    // Helper to find column case-insensitively
    const getVal = (row: Record<string, unknown>, ...keys: string[]): unknown => {
        const rowKeys = Object.keys(row);
        for (const candidate of keys) {
            const candLower = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const rk of rowKeys) {
                const rkLower = rk.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (rkLower === candLower) {
                    return row[rk];
                }
            }
        }
        return '';
    };

    rawRows.forEach((raw, idx) => {
        const rowNumber = idx + 2; // Accounting for 1-based index + header row

        const tagId = String(getVal(raw, 'Tag ID *', 'Tag ID', 'TagId', 'Tag', 'Ear Tag', 'Tag Number') || '').trim();
        const name = String(getVal(raw, 'Name', 'Cow Name', 'Animal Name') || '').trim() || undefined;
        const rawGender = String(getVal(raw, 'Gender *', 'Gender', 'Sex') || '').toLowerCase().trim();
        const breed = String(getVal(raw, 'Breed', 'Cattle Breed') || '').trim() || undefined;
        const rawDob = getVal(raw, 'Date of Birth *', 'Date of Birth', 'DOB', 'Birth Date');
        const motherTagId = String(getVal(raw, 'Mother Tag ID', 'Mother Tag', 'Mother', 'Dam Tag ID', 'Dam') || '').trim() || undefined;
        const rawMethod = String(getVal(raw, 'Breeding Method', 'Breeding', 'Method') || '').toUpperCase().trim();
        const sireTagId = String(getVal(raw, 'Sire Tag ID (Natural)', 'Sire Tag ID', 'Sire Tag', 'Sire', 'Father Tag') || '').trim() || undefined;
        const aiSireRegNo = String(getVal(raw, 'AI Sire Reg No', 'AI Sire Reg', 'Straw Code', 'AI Reg No') || '').trim() || undefined;
        const aiSireName = String(getVal(raw, 'AI Sire Name', 'AI Bull Name', 'Semen Bull') || '').trim() || undefined;
        const aiSireBreed = String(getVal(raw, 'AI Sire Breed') || '').trim() || undefined;
        const rawBorn = String(getVal(raw, 'Born on Farm', 'Born On Farm?') || '').toLowerCase().trim();
        const rawAcqDate = getVal(raw, 'Acquisition Date', 'Acq Date', 'Purchase Date');
        const acquisitionSource = String(getVal(raw, 'Acquisition Source', 'Acq Source', 'Source') || '').trim() || undefined;
        const rawCost = getVal(raw, 'Acquisition Cost', 'Cost', 'Price');
        const rawStatus = String(getVal(raw, 'Lifecycle Status', 'Status') || '').toLowerCase().trim();

        // Skip completely empty trailing rows
        if (!tagId && !rawGender && !rawDob && !name) {
            return;
        }

        const errors: string[] = [];
        const warnings: string[] = [];

        // Validation: Tag ID
        if (!tagId) {
            errors.push('Tag ID is required');
        }

        // Validation: Gender
        let gender: 'male' | 'female' = 'female';
        if (rawGender === 'male' || rawGender === 'm' || rawGender === 'bull') {
            gender = 'male';
            bulls++;
        } else if (rawGender === 'female' || rawGender === 'f' || rawGender === 'cow') {
            gender = 'female';
            cows++;
        } else {
            errors.push(`Invalid gender "${rawGender}". Must be "Female" or "Male"`);
        }

        // Validation: DOB
        const dateOfBirth = formatExcelDate(rawDob);
        if (!dateOfBirth) {
            errors.push('Date of birth is required');
        } else if (new Date(dateOfBirth) > new Date()) {
            errors.push(`Date of birth cannot be in the future (${dateOfBirth})`);
        }

        // Acquisition Date
        const acquisitionDate = rawAcqDate ? formatExcelDate(rawAcqDate) : dateOfBirth;

        // Born on farm boolean
        const bornOnFarm = rawBorn === 'no' || rawBorn === 'false' || rawBorn === 'purchased' ? false : true;

        // Cost
        const acquisitionCost = rawCost ? Number(rawCost) : undefined;

        // Status
        let lifecycleStatus: 'active' | 'sold' | 'deceased' = 'active';
        if (rawStatus === 'sold') lifecycleStatus = 'sold';
        else if (rawStatus === 'deceased' || rawStatus === 'dead') lifecycleStatus = 'deceased';

        // Breeding method
        let breedingMethod: 'NATURAL' | 'AI' | undefined = undefined;
        if (rawMethod === 'AI' || aiSireRegNo) {
            breedingMethod = 'AI';
        } else if (rawMethod === 'NATURAL' || sireTagId) {
            breedingMethod = 'NATURAL';
        }

        // Lineage tracking count
        if (motherTagId) {
            withMother++;
            if (motherTagId.toLowerCase() === tagId.toLowerCase()) {
                errors.push('Animal cannot be its own mother');
            }
        }

        if (aiSireRegNo) {
            withAISire++;
        } else if (sireTagId) {
            withSire++;
            if (sireTagId.toLowerCase() === tagId.toLowerCase()) {
                errors.push('Animal cannot be its own sire');
            }
        }

        const isValid = errors.length === 0;

        const parsed: BulkImportCowRow = {
            tagId,
            name,
            gender,
            breed,
            dateOfBirth,
            acquisitionDate,
            acquisitionSource,
            acquisitionCost,
            lifecycleStatus,
            bornOnFarm,
            motherTagId,
            sireTagId,
            aiSireRegNo,
            aiSireName,
            aiSireBreed,
            breedingMethod,
        };

        rows.push({
            rowNumber,
            raw,
            parsed,
            isValid,
            errors,
            warnings,
        });
    });

    const valid = rows.filter((r) => r.isValid).length;
    const invalid = rows.filter((r) => !r.isValid).length;

    return {
        rows,
        summary: {
            total: rows.length,
            valid,
            invalid,
            bulls,
            cows,
            withMother,
            withSire,
            withAISire,
        },
    };
}
