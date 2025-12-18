// src/common/utils.ts - GLOBAL BigInt JSON FIX
export const toJsonSafe = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (key: string, value: any) => {
      if (typeof value === 'bigint') {
        return value.toString(); // Convert BigInt → string
      }
      return value;
    })
  );
};

// Usage in ANY controller:
// res.json(toJsonSafe(student));  ✅ No more BigInt errors!
