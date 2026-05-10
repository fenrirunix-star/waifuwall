import { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db, dbStandard } from "@/src/lib/firebase";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-utils";

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (!db && !dbStandard) {
       return;
    }
    
    const mergeCats = (newData: any[]) => {
      setCategories(prev => {
        const combined = [...prev, ...newData];
        const uniqueMap = new Map();
        // We use the category name as the unique key to merge duplicates
        combined.forEach(item => {
          const key = (item.name || '').trim().toLowerCase();
          if (!key) return; // Skip invalid entries
          
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          } else {
            // If it already exists, we can optionally merge properties
            const existing = uniqueMap.get(key);
            uniqueMap.set(key, { ...existing, ...item });
          }
        });
        return Array.from(uniqueMap.values());
      });
    };

    const fetchFromDb = async (firestore: any, label: string) => {
      if (!firestore) return;
      try {
        const col = collection(firestore, "categories");
        const snap = await getDocs(col);
        mergeCats(snap.docs.map(d => ({ id: d.id, origin: label, ...d.data() })));
      } catch (err) {
        console.error(`Failed categories from ${label}:`, err);
      }
    };

    if (db) fetchFromDb(db, "Enterprise");
    if (dbStandard && dbStandard !== db) {
      fetchFromDb(dbStandard, "Standard");
    }

    let unsubPrimary = () => {};
    if (db) {
      unsubPrimary = onSnapshot(collection(db, "categories"), (snap) => {
        mergeCats(snap.docs.map(d => ({ id: d.id, origin: "Enterprise", ...d.data() })));
      }, () => {});
    }

    let unsubStandard = () => {};
    if (dbStandard && dbStandard !== db) {
      unsubStandard = onSnapshot(collection(dbStandard, "categories"), (snap) => {
        mergeCats(snap.docs.map(d => ({ id: d.id, origin: "Standard", ...d.data() })));
      }, () => {});
    }

    return () => {
      unsubPrimary();
      unsubStandard();
    };
  }, [db, dbStandard]);

  return { categories, setCategories };
}
