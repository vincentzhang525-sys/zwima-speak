import type { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
  {
    id: "supermarket",
    title: "Supermarket",
    icon: "🛒",
    description: "Shopping, asking prices, and checkout",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    icon: "🍽️",
    description: "Ordering food and asking about dishes",
  },
  {
    id: "doctor",
    title: "Doctor Appointment",
    icon: "🏥",
    description: "Describing symptoms and booking visits",
  },
  {
    id: "pharmacy",
    title: "Pharmacy",
    icon: "💊",
    description: "Buying medicine and asking for advice",
  },
  {
    id: "landlord",
    title: "Landlord",
    icon: "🏠",
    description: "Rent, repairs, and apartment issues",
  },
  {
    id: "bank",
    title: "Bank",
    icon: "🏦",
    description: "Opening accounts and banking services",
  },
  {
    id: "business-meeting",
    title: "Business Meeting",
    icon: "💼",
    description: "Presentations, negotiations, and updates",
  },
  {
    id: "phone-call",
    title: "Phone Call",
    icon: "📞",
    description: "Scheduling, inquiries, and follow-ups",
  },
];

export const LANGUAGE_LABELS = {
  german: { label: "German", flag: "🇩🇪", native: "Deutsch" },
  english: { label: "English", flag: "🇬🇧", native: "English" },
} as const;
