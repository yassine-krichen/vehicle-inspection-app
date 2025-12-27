/**
 * Application-wide constants
 */

// Date and time formats
export const DATE_FORMAT = "MMM d, yyyy"
export const TIME_FORMAT = "h:mm a"

// Database limits
export const MAX_CUSTOMER_NAME_LENGTH = 100
export const MAX_CUSTOMER_EMAIL_LENGTH = 255
export const MAX_VEHICLE_MAKE_LENGTH = 50
export const MAX_VEHICLE_MODEL_LENGTH = 50
export const MIN_VEHICLE_YEAR = 1900
export const MAX_VEHICLE_YEAR = new Date().getFullYear() + 1

// Inspection constants
export const INSPECTION_STATUS = {
  GREEN: "green",
  YELLOW: "yellow",
  RED: "red",
  NA: "na",
  DRAFT: "draft",
  COMPLETED: "completed",
} as const

export type InspectionStatus = (typeof INSPECTION_STATUS)[keyof typeof INSPECTION_STATUS]

// Share token validation
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Rate limiting (for future implementation)
export const RATE_LIMIT = {
  TOKEN_ROTATION_PER_HOUR: 5,
  INSPECTION_CREATION_PER_HOUR: 50,
} as const
