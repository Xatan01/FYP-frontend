import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { NotebookPen, Plus } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

const initialEntries = [
  {
    id: "t1",
    symbol: "AAPL",
    date: "2025-10-22",
    pnl: "+$120",
    note: "Followed breakout above 190, took partial profits.",
  },
  {
    id: "t2",
    symbol: "DBS",
    date: "2025-10-20",
    pnl: "-$45",
    note: "Stopped out after trend reversal.",
  },
  {
    id: "t3",
    symbol: "CIT",
    date: "2025-10-19",
    pnl: "+$80",
    note: "Held through earnings, good volume.",
  },
];

export default function TradingJournal() {
  const [entries, setEntries] = useState(initialEntries);
  const [symbol, setSymbol] = useState("");
  const [date, setDate] = useState("");
  const [pnl, setPnl] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setSymbol("");
    setDate("");
    setPnl("");
    setNote("");
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!symbol.trim() || !date.trim()) return;
    if (editingId) {
      setEntries(
        entries.map((entry) =>
          entry.id === editingId
            ? { ...entry, symbol, date, pnl, note }
            : entry
        )
      );
      resetForm();
      return;
    }
    const next = {
      id: `t-${Date.now()}`,
      symbol: symbol.trim().toUpperCase(),
      date: date.trim(),
      pnl: pnl.trim() || "$0",
      note: note.trim() || "No notes added.",
    };
    setEntries([next, ...entries]);
    resetForm();
  };

  const handleEdit = (entry) => {
    setSymbol(entry.symbol);
    setDate(entry.date);
    setPnl(entry.pnl);
    setNote(entry.note);
    setEditingId(entry.id);
  };

  const handleDelete = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Trading Journal</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
            <Plus size={16} color="#fff" />
            <Text style={styles.addText}>
              {editingId ? "Save Entry" : "Add Entry"}
            </Text>
          </TouchableOpacity>
        </View>

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
                placeholderTextColor="#94a3b8"
                value={symbol}
                onChangeText={setSymbol}
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.formInputWrap}>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>
          <TextInput
            style={styles.formInput}
            placeholder="P/L e.g. +$120"
            placeholderTextColor="#94a3b8"
            value={pnl}
            onChangeText={setPnl}
          />
          <TextInput
            style={[styles.formInput, styles.formNote]}
            placeholder="Notes"
            placeholderTextColor="#94a3b8"
            value={note}
            onChangeText={setNote}
            multiline
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveText}>
                {editingId ? "Save Changes" : "Add Entry"}
              </Text>
            </TouchableOpacity>
            {editingId && (
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {entries.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <NotebookPen size={18} color="#2563eb" />
              <Text style={styles.symbol}>{entry.symbol}</Text>
              <Text style={styles.date}>{entry.date}</Text>
              <Text
                style={[
                  styles.pnl,
                  entry.pnl.startsWith("+") ? styles.pnlUp : styles.pnlDown,
                ]}
              >
                {entry.pnl}
              </Text>
            </View>
            <Text style={styles.note}>{entry.note}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(entry)}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(entry.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#2563eb",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 999,
  },
  addText: { color: "#fff", fontSize: moderateScale(12), fontWeight: "600" },
  formCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(12),
  },
  formRow: { flexDirection: "row", gap: scale(10), marginBottom: verticalScale(8) },
  formLabel: { flex: 1, fontSize: moderateScale(11), color: "#64748b" },
  formInputWrap: { flex: 1 },
  formInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(12),
    color: "#0f172a",
    marginBottom: verticalScale(8),
  },
  formNote: { minHeight: verticalScale(70), textAlignVertical: "top" },
  formActions: { flexDirection: "row", gap: scale(10) },
  saveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: verticalScale(10),
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: moderateScale(12), fontWeight: "600" },
  cancelButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(14),
    alignItems: "center",
  },
  cancelText: { color: "#475569", fontSize: moderateScale(12), fontWeight: "600" },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(6),
  },
  symbol: { fontSize: moderateScale(14), fontWeight: "700", color: "#0f172a" },
  date: { fontSize: moderateScale(12), color: "#64748b" },
  pnl: { marginLeft: "auto", fontSize: moderateScale(12), fontWeight: "700" },
  pnlUp: { color: "#16a34a" },
  pnlDown: { color: "#dc2626" },
  note: { fontSize: moderateScale(13), color: "#334155" },
  cardActions: {
    flexDirection: "row",
    gap: scale(8),
    marginTop: verticalScale(8),
  },
  editButton: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 10,
  },
  editText: { color: "#2563eb", fontSize: moderateScale(11), fontWeight: "600" },
  deleteButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 10,
  },
  deleteText: { color: "#dc2626", fontSize: moderateScale(11), fontWeight: "600" },
});
