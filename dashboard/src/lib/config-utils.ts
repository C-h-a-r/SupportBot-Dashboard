export function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let cur: unknown = obj;
  for (const key of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

export function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const keys = path.split(".");
  const clone = structuredClone(obj);
  let cur: Record<string, unknown> = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (cur[key] == null || typeof cur[key] !== "object") {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

export function flattenUpdates(
  configFile: string,
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      Object.keys(val as object).length > 0 &&
      !isLeafObject(val as Record<string, unknown>)
    ) {
      Object.assign(out, flattenUpdates(configFile, val as Record<string, unknown>, path));
    } else {
      out[`${configFile}:${path}`] = val;
    }
  }
  return out;
}

function isLeafObject(o: Record<string, unknown>): boolean {
  return Object.values(o).every(
    (v) => v === null || typeof v !== "object" || Array.isArray(v),
  );
}
