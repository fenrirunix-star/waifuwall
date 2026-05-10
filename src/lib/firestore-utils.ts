import { auth, db, dbEnterprise } from "./firebase";
import { doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  const errorJson = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorJson);
  throw new Error(errorJson);
}

export async function incrementWallpaperStat(wallpaperId: string, origin: string | undefined, field: 'views' | 'downloads') {
  const targetDb = origin === "Enterprise" ? dbEnterprise : db;
  if (!targetDb) return;
  
  const path = `wallpapers/${wallpaperId}`;
  try {
    const wallpaperRef = doc(targetDb, "wallpapers", wallpaperId);
    await updateDoc(wallpaperRef, {
      [field]: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('No document to update')) {
      console.warn(`Wallpaper ${wallpaperId} not found, skipping stats increment.`);
      return;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}
