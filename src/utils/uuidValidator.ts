import { validate as uuidValidate, version as uuidVersion } from "uuid";

/**
 * Validates if the string is a valid UUID v4
 */
export const isValidUuid = (uuid: string): boolean => {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
};

/**
 * Ensures a UUID has the proper format
 * Returns the corrected UUID if possible, or null if it can't be fixed
 */
export const ensureValidUuid = (uuid: string): string | null => {
  // If already valid, return as is
  if (isValidUuid(uuid)) {
    return uuid;
  }

  // Common error: missing character in first segment
  if (uuid.length === 35 && uuid.charAt(8) === "-") {
    // Add a leading character (0) to the first segment
    const correctedUuid = "0" + uuid;
    return isValidUuid(correctedUuid) ? correctedUuid : null;
  }

  return null;
};
