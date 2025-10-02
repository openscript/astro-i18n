export function getAllUniqueKeys(obj: Record<string, unknown>, keys = new Set<string>(), ignore?: boolean): Set<string> {
  Object.entries(obj).forEach(([key, value]) => {
    if (!ignore) keys.add(key);
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item && typeof item === "object") {
            // Recurse into objects and arrays within arrays
            if (Array.isArray(item)) {
              // Wrap array in an object to reuse the function and ignore its key
              getAllUniqueKeys({ array: item }, keys, true);
            } else {
              getAllUniqueKeys(item as Record<string, unknown>, keys);
            }
          }
        });
      } else {
        getAllUniqueKeys(value as Record<string, unknown>, keys);
      }
    }
  });
  return keys;
}

function recursivePruneLocales(obj: Record<string, unknown>, locales: string[], locale: string) {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return recursivePruneLocales(item as Record<string, unknown>, locales, locale);
        }
        return item;
      });
    } else if (value && typeof value === "object") {
      const valueAsRecord = value as Record<string, unknown>;
      const hasLocales = Object.keys(valueAsRecord).some((k) => locales.includes(k));
      let prunedValue: unknown | undefined = undefined;

      if (hasLocales) {
        prunedValue = valueAsRecord[locale] ?? undefined;
      } else {
        prunedValue = recursivePruneLocales(valueAsRecord, locales, locale);
      }

      result[key] = prunedValue;
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function pruneLocales(obj: Record<string, unknown>, locales: string[], locale: string) {
  if (Object.keys(obj).find((key) => locales.includes(key))) throw new Error("Top-level locales are not allowed");
  if (Object.keys(obj).length === 0) return obj;

  return recursivePruneLocales(obj, locales, locale);
}
