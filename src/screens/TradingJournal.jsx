import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, NotebookPen, Plus } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import {
  createJournalEntry,
  deleteJournalEntry,
  fetchJournalEntries,
  updateJournalEntry,
} from "../api/tradingJournal";

function parsePnlAmount(rawValue) {
  const normalized = String(rawValue || "").trim();
  if (!normalized) return 0;
  const cleaned = normalized.replace(/\$/g, "").replace(/,/g, "");
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function formatPnlDisplay(rawValue) {
  const amount = Number(rawValue);
  if (!Number.isFinite(amount)) return "$0.00";
  const absValue = Math.abs(amount).toFixed(2);
  if (amount > 0) return `+$${absValue}`;
  if (amount < 0) return `-$${absValue}`;
  return `$${absValue}`;
}

function formatPnlInput(rawValue) {
  const amount = Number(rawValue);
  if (!Number.isFinite(amount)) return "";
  return amount > 0 ? `+${amount.toFixed(2)}` : amount.toFixed(2);
}

export default function TradingJournal({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [symbol, setSymbol] = useState("");
  const [date, setDate] = useState("");
  const [pnl, setPnl] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadEntries = useCallback(async ({ showSpinner = false } = {}) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const response = await fetchJournalEntries({ limit: 100, offset: 0 });
      setEntries(Array.isArray(response?.items) ? response.items : []);
    } catch (err) {
      setError(err?.message || "Failed to load journal entries.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries({ showSpinner: true });
  }, [loadEntries]);

  const resetForm = () => {
    setSymbol("");
    setDate("");
    setPnl("");
    setNote("");
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (saving) return;
    if (!symbol.trim() || !date.trim()) {
      setError("Symbol and date are required.");
      return;
    }

    const pnlAmount = parsePnlAmount(pnl);
    if (pnlAmount === null) {
      setError("P/L must be a valid number (e.g. +120, -45.5, 0).");
      return;
    }

    const payload = {
      symbol: symbol.trim().toUpperCase(),
      entry_date: date.trim(),
      pnl_amount: pnlAmount,
      note: note.trim() || "No notes added.",
    };

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const updated = await updateJournalEntry(editingId, payload);
        setEntries((prev) =>
          prev.map((entry) => (entry.entry_id === editingId ? updated : entry))
        );
      } else {
        const created = await createJournalEntry(payload);
        setEntries((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err?.message || "Failed to save journal entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setSymbol(entry.symbol);
    setDate(entry.entry_date);
    setPnl(formatPnlInput(entry.pnl_amount));
    setNote(entry.note);
    setEditingId(entry.entry_id);
  };

  const handleDelete = async (entryId) => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await deleteJournalEntry(entryId);
      setEntries((prev) => prev.filter((entry) => entry.entry_id !== entryId));
      if (editingId === entryId) {
        resetForm();
      }
    } catch (err) {
      setError(err?.message || "Failed to delete journal entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading journal...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={16} color="#bfdbfe" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={["#1e293b", "#0f172a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.eyebrow}>JOURNAL</Text>
            <Text style={styles.header}>Trading Journal</Text>
            <Text style={styles.subtitle}>
              Track every trade decision and review what worked.
            </Text>
            <TouchableOpacity
              style={[styles.heroAddButton, saving ? styles.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Plus size={15} color="#dbeafe" />
              <Text style={styles.heroAddText}>
                {saving ? "Saving..." : editingId ? "Save Entry" : "Add Entry"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {!!error && (
            <View style={styles.errorCard}>
              <Text style={styles.error}>{error}</Text>
            </View>
          )}

          <View style={styles.formCard}>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Symbol</Text>
              <Text style={styles.formLabel}>Date</Text>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formInputWrap}>
                <TextInput
                  style={styles.formInput}
                  placeholder="AAPL"
                  placeholderTextColor="#64748b"
                  value={symbol}
                  onChangeText={setSymbol}
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.formInputWrap}>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#64748b"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>
            <TextInput
              style={styles.formInput}
              placeholder="P/L e.g. +120"
              placeholderTextColor="#64748b"
              value={pnl}
              onChangeText={setPnl}
            />
            <TextInput
              style={[styles.formInput, styles.formNote]}
              placeholder="Notes"
              placeholderTextColor="#64748b"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.saveButton, saving ? styles.buttonDisabled : null]}
                onPress={handleSubmit}
                disabled={saving}
              >
                <Text style={styles.saveText}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Entry"}
                </Text>
              </TouchableOpacity>
              {editingId ? (
                <TouchableOpacity
                  style={[styles.cancelButton, saving ? styles.buttonDisabled : null]}
                  onPress={resetForm}
                  disabled={saving}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {entries.map((entry) => {
            const pnlAmount = Number(entry.pnl_amount ?? 0);
            return (
              <View key={entry.entry_id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <NotebookPen size={16} color="#93c5fd" />
                  <Text style={styles.symbol}>{entry.symbol}</Text>
                  <Text style={styles.date}>{entry.entry_date}</Text>
                  <Text
                    style={[
                      styles.pnl,
                      pnlAmount > 0
                        ? styles.pnlUp
                        : pnlAmount < 0
                        ? styles.pnlDown
                        : styles.pnlNeutral,
                    ]}
                  >
                    {formatPnlDisplay(pnlAmount)}
                  </Text>
                </View>
                <Text style={styles.note}>{entry.note}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.editButton, saving ? styles.buttonDisabled : null]}
                    onPress={() => handleEdit(entry)}
                    disabled={saving}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteButton, saving ? styles.buttonDisabled : null]}
                    onPress={() => handleDelete(entry.entry_id)}
                    disabled={saving}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {entries.length === 0 ? (
            <Text style={styles.emptyState}>No journal entries yet.</Text>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  container: { flex: 1 },
  content: { padding: scale(18), paddingBottom: verticalScale(48) },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    backgroundColor: "#020617",
  },
  loadingText: { color: "#94a3b8", fontSize: moderateScale(12) },
  backBtn: {
    marginBottom: verticalScale(12),
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 999,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  backBtnText: { color: "#bfdbfe", fontSize: moderateScale(13), fontWeight: "700" },
  hero: {
    borderRadius: 20,
    padding: scale(18),
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: verticalScale(14),
  },
  eyebrow: {
    color: "#7dd3fc",
    fontSize: moderateScale(11),
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: verticalScale(6),
  },
  header: {
    color: "#e2e8f0",
    fontSize: moderateScale(24),
    fontWeight: "800",
    marginBottom: verticalScale(6),
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: moderateScale(13),
    marginBottom: verticalScale(12),
  },
  heroAddButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#1e3a8a",
    borderRadius: 10,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  heroAddText: { color: "#dbeafe", fontSize: moderateScale(12), fontWeight: "700" },
  errorCard: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#7f1d1d",
    padding: scale(10),
    marginBottom: verticalScale(10),
  },
  error: {
    color: "#fca5a5",
    fontSize: moderateScale(12),
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  formCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: verticalScale(12),
  },
  formRow: { flexDirection: "row", gap: scale(10), marginBottom: verticalScale(8) },
  formLabel: { flex: 1, fontSize: moderateScale(11), color: "#94a3b8" },
  formInputWrap: { flex: 1 },
  formInput: {
    backgroundColor: "#111827",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(9),
    fontSize: moderateScale(12),
    color: "#f8fafc",
    marginBottom: verticalScale(8),
  },
  formNote: { minHeight: verticalScale(70), textAlignVertical: "top" },
  formActions: { flexDirection: "row", gap: scale(10) },
  saveButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: verticalScale(10),
    alignItems: "center",
  },
  saveText: { color: "#eff6ff", fontSize: moderateScale(12), fontWeight: "700" },
  cancelButton: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(14),
    alignItems: "center",
  },
  cancelText: { color: "#cbd5e1", fontSize: moderateScale(12), fontWeight: "700" },
  sectionHeader: {
    color: "#e2e8f0",
    fontSize: moderateScale(14),
    fontWeight: "700",
    marginBottom: verticalScale(8),
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: scale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(6),
  },
  symbol: { fontSize: moderateScale(14), fontWeight: "700", color: "#e2e8f0" },
  date: { fontSize: moderateScale(12), color: "#94a3b8" },
  pnl: { marginLeft: "auto", fontSize: moderateScale(12), fontWeight: "700" },
  pnlUp: { color: "#86efac" },
  pnlDown: { color: "#fca5a5" },
  pnlNeutral: { color: "#cbd5e1" },
  note: { fontSize: moderateScale(13), color: "#cbd5e1" },
  cardActions: {
    flexDirection: "row",
    gap: scale(8),
    marginTop: verticalScale(8),
  },
  editButton: {
    backgroundColor: "#1e3a8a",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 10,
  },
  editText: { color: "#dbeafe", fontSize: moderateScale(11), fontWeight: "700" },
  deleteButton: {
    backgroundColor: "#7f1d1d",
    borderWidth: 1,
    borderColor: "#991b1b",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 10,
  },
  deleteText: { color: "#fecaca", fontSize: moderateScale(11), fontWeight: "700" },
  emptyState: {
    textAlign: "center",
    color: "#64748b",
    fontSize: moderateScale(12),
    marginTop: verticalScale(12),
  },
});
