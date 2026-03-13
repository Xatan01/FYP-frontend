import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
import { useAppTheme } from "../context/ThemeContext";
import LoadingState from "../components/LoadingState";

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
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
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
        <LoadingState
          variant="screen"
          title="Loading journal"
          message="Gathering your trade notes, outcomes, and saved reflections."
        />
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={16} color={palette.accentSoftText} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={isLight ? ["#dbeafe", "#eff6ff"] : ["#1e293b", "#0f172a"]}
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
              <Plus size={15} color={palette.accentSoftText} />
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
                  placeholderTextColor={palette.textMuted}
                  value={symbol}
                  onChangeText={setSymbol}
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.formInputWrap}>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={palette.textMuted}
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>
            <TextInput
              style={styles.formInput}
              placeholder="P/L e.g. +120"
              placeholderTextColor={palette.textMuted}
              value={pnl}
              onChangeText={setPnl}
            />
            <TextInput
              style={[styles.formInput, styles.formNote]}
              placeholder="Notes"
              placeholderTextColor={palette.textMuted}
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
                  <NotebookPen size={16} color={palette.accentSoftText} />
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

function buildStyles(palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    container: { flex: 1 },
    content: { padding: scale(18), paddingBottom: verticalScale(48) },
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      backgroundColor: palette.background,
    },
    loadingText: { color: palette.textMuted, fontSize: moderateScale(12) },
    backBtn: {
      marginBottom: verticalScale(12),
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
      borderRadius: 999,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    backBtnText: { color: palette.accentSoftText, fontSize: moderateScale(13), fontWeight: "700" },
    hero: {
      borderRadius: 20,
      padding: scale(18),
      borderWidth: 1,
      borderColor: palette.inputBorder,
      marginBottom: verticalScale(14),
    },
    eyebrow: {
      color: palette.accentSoftText,
      fontSize: moderateScale(11),
      fontWeight: "800",
      letterSpacing: 0.8,
      marginBottom: verticalScale(6),
    },
    header: {
      color: palette.textPrimary,
      fontSize: moderateScale(24),
      fontWeight: "800",
      marginBottom: verticalScale(6),
    },
    subtitle: {
      color: palette.textMuted,
      fontSize: moderateScale(13),
      marginBottom: verticalScale(12),
    },
    heroAddButton: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      backgroundColor: palette.accentSoft,
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 10,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(8),
    },
    heroAddText: { color: palette.accentSoftText, fontSize: moderateScale(12), fontWeight: "700" },
    errorCard: {
      backgroundColor: palette.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.danger,
      padding: scale(10),
      marginBottom: verticalScale(10),
    },
    error: {
      color: palette.danger,
      fontSize: moderateScale(12),
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    formCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: scale(14),
      borderWidth: 1,
      borderColor: palette.cardBorder,
      marginBottom: verticalScale(12),
    },
    formRow: { flexDirection: "row", gap: scale(10), marginBottom: verticalScale(8) },
    formLabel: { flex: 1, fontSize: moderateScale(11), color: palette.textMuted },
    formInputWrap: { flex: 1 },
    formInput: {
      backgroundColor: palette.input,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.inputBorder,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(9),
      fontSize: moderateScale(12),
      color: palette.textPrimary,
      marginBottom: verticalScale(8),
    },
    formNote: { minHeight: verticalScale(70), textAlignVertical: "top" },
    formActions: { flexDirection: "row", gap: scale(10) },
    saveButton: {
      flex: 1,
      backgroundColor: palette.accent,
      borderRadius: 10,
      paddingVertical: verticalScale(10),
      alignItems: "center",
    },
    saveText: { color: palette.white, fontSize: moderateScale(12), fontWeight: "700" },
    cancelButton: {
      backgroundColor: palette.cardSoft,
      borderWidth: 1,
      borderColor: palette.inputBorder,
      borderRadius: 10,
      paddingVertical: verticalScale(10),
      paddingHorizontal: scale(14),
      alignItems: "center",
    },
    cancelText: { color: palette.textSecondary, fontSize: moderateScale(12), fontWeight: "700" },
    sectionHeader: {
      color: palette.textPrimary,
      fontSize: moderateScale(14),
      fontWeight: "700",
      marginBottom: verticalScale(8),
    },
    card: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: scale(14),
      marginBottom: verticalScale(12),
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      marginBottom: verticalScale(6),
    },
    symbol: { fontSize: moderateScale(14), fontWeight: "700", color: palette.textPrimary },
    date: { fontSize: moderateScale(12), color: palette.textMuted },
    pnl: { marginLeft: "auto", fontSize: moderateScale(12), fontWeight: "700" },
    pnlUp: { color: palette.successSoftText },
    pnlDown: { color: palette.dangerSoftText },
    pnlNeutral: { color: palette.textSecondary },
    note: { fontSize: moderateScale(13), color: palette.textSecondary },
    cardActions: {
      flexDirection: "row",
      gap: scale(8),
      marginTop: verticalScale(8),
    },
    editButton: {
      backgroundColor: palette.accentSoft,
      borderWidth: 1,
      borderColor: palette.accent,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: 10,
    },
    editText: { color: palette.accentSoftText, fontSize: moderateScale(11), fontWeight: "700" },
    deleteButton: {
      backgroundColor: palette.dangerSoft,
      borderWidth: 1,
      borderColor: palette.danger,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: 10,
    },
    deleteText: { color: palette.dangerSoftText, fontSize: moderateScale(11), fontWeight: "700" },
    emptyState: {
      textAlign: "center",
      color: palette.textMuted,
      fontSize: moderateScale(12),
      marginTop: verticalScale(12),
    },
  });
}
