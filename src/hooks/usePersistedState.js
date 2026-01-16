import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (!mounted) return;
        if (raw !== null) {
          setValue(JSON.parse(raw));
        }
      } catch (err) {
        if (mounted) setError("Failed to load saved data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [key]);

  const setPersistedValue = useCallback(
    (nextValue) => {
      setValue((prev) => {
        const resolved = typeof nextValue === "function" ? nextValue(prev) : nextValue;
        AsyncStorage.setItem(key, JSON.stringify(resolved)).catch(() => {
          setError("Failed to save changes.");
        });
        return resolved;
      });
    },
    [key]
  );

  return { value, setValue: setPersistedValue, loading, error };
}
