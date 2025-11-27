// types/avatar.ts

// The list of source types defined in models.py
export type SourceType = "notes" | "reminders" | "todos" | "uploads" | "gmail" | "manual" | "website";

// Represents a unified item from any source (used for selection details)
interface UnifiedItem {
    id: string | number;
    title: string;
    description?: string;
}

// Represents the state of a single source configuration for the Avatar
interface AvatarSourceConfig {
    type: SourceType;
    label: string;
    isEnabled: boolean; // Corresponds to AvatarSource.enabled
    includeForTone: boolean; // Corresponds to AvatarSource.include_for_tone
    includeForKnowledge: boolean; // Corresponds to AvatarSource.include_for_knowledge
    selectedIds: (string | number)[]; // Specific IDs chosen for filtering
    data?: UnifiedItem[]; // Optional: The list of items fetched from unified API
    metadata?: any; // For integrations like Gmail (e.g., labels, account ID)
    hasDetailView: boolean; // Does this source type need a panel for specific item selection?
}