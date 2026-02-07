export interface Counter {
    id: string;
    count: number;
    lastUpdated: string;
}

export interface PersonalRecord {
    recordType: string;
    value: number;
    unit: string;
    activityId?: string;
    achievedAt?: string;
    activityType?: string;
    previousValue?: number;
    improvement?: number;
}

/** Generic booster data entry from the booster_data sub-collection */
export interface BoosterDataEntry {
    id: string;
    data: Record<string, unknown>;
}
