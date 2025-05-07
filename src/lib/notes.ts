import { Timestamp } from "firebase/firestore";

export interface Note {
    title: string;
    description: string;
    createdAt: Date | Timestamp | string;
    updatedAt?: Date | Timestamp | string;
}

export const convertTimestampToDate = (timestamp: Date | Timestamp | string): Date => {
    if (timestamp instanceof Date) {
        return timestamp;
    }
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    if (typeof timestamp === 'string') {
        return new Date(timestamp);
    }
    return new Date(); // fallback to current date
};

export const formatDate = (date: Date | Timestamp | string | undefined | null): string => {
    if (!date) return "Never";
    const dateObj = convertTimestampToDate(date);
    return dateObj.toLocaleDateString();
};