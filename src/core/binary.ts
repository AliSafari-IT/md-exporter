import { isBinaryFile } from 'isbinaryfile';

export async function checkBinary(filePath: string): Promise<boolean> {
  try {
    return await isBinaryFile(filePath);
  } catch {
    return true;
  }
}
