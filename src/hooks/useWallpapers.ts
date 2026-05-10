import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db, dbStandard } from "@/src/lib/firebase";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-utils";

export function useWallpapers(limitCount?: number) {
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db && !dbStandard) {
      setLoading(false);
      return;
    }

    const mergeData = (newData: any[]) => {
      setWallpapers(prev => {
        const combined = [...prev, ...newData];
        // Deduplicate by ID
        const uniqueMap = new Map();
        combined.forEach(item => uniqueMap.set(item.id, item));
        return Array.from(uniqueMap.values());
      });
    };

    const fetchFromDb = async (firestore: any, label: string) => {
      if (!firestore) return;
      try {
        const col = collection(firestore, "wallpapers");
        // Try ordered first
        try {
          const q = limitCount 
            ? query(col, orderBy("createdAt", "desc"), limit(limitCount))
            : query(col, orderBy("createdAt", "desc"));
          const snap = await getDocs(q);
          if (!snap.empty) {
            mergeData(snap.docs.map(d => ({ id: d.id, origin: label, ...d.data() })));
            return;
          }
        } catch (e) {
          console.log(`Ordered fetch for ${label} failed, trying basic`);
        }

        // Basic fallback
        const qBasic = limitCount ? query(col, limit(limitCount)) : query(col);
        const snapBasic = await getDocs(qBasic);
        mergeData(snapBasic.docs.map(d => ({ id: d.id, origin: label, ...d.data() })));
      } catch (err) {
        console.error(`Failed to fetch wallpapers from ${label}:`, err);
      }
    };

    const loadAll = async () => {
      setLoading(true);
      // We don't reset to empty here to allow incremental loading if possible, 
      // but the initial state is empty anyway if it's the first mount.
      
      const tasks = [];
      if (db) {
        tasks.push(fetchFromDb(db, "Enterprise").catch(e => console.error("Enterprise DB load failed", e)));
      }
      if (dbStandard && dbStandard !== db) {
        tasks.push(fetchFromDb(dbStandard, "Standard").catch(e => console.error("Standard DB load failed", e)));
      }
      
      await Promise.all(tasks);
      setLoading(false);
    };

    loadAll();

    // Live updates for both
    let unsubPrimary = () => {};
    if (db) {
      unsubPrimary = onSnapshot(query(collection(db, "wallpapers"), limit(limitCount || 20)), (snap) => {
        mergeData(snap.docs.map(d => ({ id: d.id, origin: "Enterprise", ...d.data() })));
      });
    }

    let unsubStandard = () => {};
    if (dbStandard && dbStandard !== db) {
      unsubStandard = onSnapshot(query(collection(dbStandard, "wallpapers"), limit(limitCount || 20)), (snap) => {
        mergeData(snap.docs.map(d => ({ id: d.id, origin: "Standard", ...d.data() })));
      });
    }

    return () => {
      unsubPrimary();
      unsubStandard();
    };
  }, [db, dbStandard, limitCount]);

  return { wallpapers, loading };
}
