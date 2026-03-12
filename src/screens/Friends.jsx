import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Search, UserRoundPlus, Users } from "lucide-react-native";
import { moderateScale, scale, verticalScale } from "../styles/responsive";
import {
  acceptFriendRequest,
  declineFriendRequest,
  fetchFriendsList,
  fetchIncomingFriendRequests,
  fetchMyFriendProfile,
  fetchOutgoingFriendRequests,
  removeFriend,
  searchFriendProfiles,
  sendFriendRequest,
  updateMyFriendProfile,
} from "../api/friends";

function getInitials(username) {
  const raw = String(username || "").trim().replace(/^@/, "");
  if (!raw) return "U";
  return raw.slice(0, 2).toUpperCase();
}

function relationLabel(relation) {
  switch (relation) {
    case "friend":
      return "In your circle";
    case "incoming_pending":
      return "Sent you a request";
    case "outgoing_pending":
      return "Invite sent";
    default:
      return "Not connected yet";
  }
}

function UserRow({
  username,
  subtitle,
  rightNode,
  rowStyle,
}) {
  return (
    <View style={[styles.row, rowStyle]}>
      <View style={styles.rowLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(username)}</Text>
        </View>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>@{username}</Text>
          <Text style={styles.rowSub}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.rowRight}>{rightNode}</View>
    </View>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.cardHint}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export default function Friends({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [myProfile, setMyProfile] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friends, setFriends] = useState([]);

  const refreshLists = useCallback(async () => {
    const [profileRes, incomingRes, outgoingRes, friendsRes] = await Promise.all([
      fetchMyFriendProfile(),
      fetchIncomingFriendRequests(),
      fetchOutgoingFriendRequests(),
      fetchFriendsList(),
    ]);
    setMyProfile(profileRes || null);
    setUsernameInput(profileRes?.username || "");
    setIncoming(Array.isArray(incomingRes?.items) ? incomingRes.items : []);
    setOutgoing(Array.isArray(outgoingRes?.items) ? outgoingRes.items : []);
    setFriends(Array.isArray(friendsRes?.items) ? friendsRes.items : []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await refreshLists();
    } catch (err) {
      setError(err?.message || "Failed to load friends.");
    } finally {
      setLoading(false);
    }
  }, [refreshLists]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const runSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchFriendProfiles(q, 12);
      setSearchResults(Array.isArray(res?.items) ? res.items : []);
    } catch (err) {
      setError(err?.message || "Failed to search users.");
    }
  }, [searchQuery]);

  const updateUsername = async () => {
    if (busy) return;
    const username = usernameInput.trim();
    if (!username) return;
    setBusy(true);
    setError("");
    try {
      const updated = await updateMyFriendProfile(username);
      setMyProfile(updated);
      setUsernameInput(updated?.username || username);
    } catch (err) {
      setError(err?.message || "Failed to update username.");
    } finally {
      setBusy(false);
    }
  };

  const requestFriend = async (username) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await sendFriendRequest(username);
      await refreshLists();
      await runSearch();
    } catch (err) {
      setError(err?.message || "Failed to send request.");
    } finally {
      setBusy(false);
    }
  };

  const acceptRequest = async (friendshipId) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await acceptFriendRequest(friendshipId);
      await refreshLists();
      await runSearch();
    } catch (err) {
      setError(err?.message || "Failed to accept request.");
    } finally {
      setBusy(false);
    }
  };

  const declineRequest = async (friendshipId) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await declineFriendRequest(friendshipId);
      await refreshLists();
      await runSearch();
    } catch (err) {
      setError(err?.message || "Failed to decline request.");
    } finally {
      setBusy(false);
    }
  };

  const removeFriendAction = async (userId) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await removeFriend(userId);
      await refreshLists();
      await runSearch();
    } catch (err) {
      setError(err?.message || "Failed to remove friend.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading friends...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
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
          colors={["#1e3a8a", "#0f172a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleRow}>
              <Users size={18} color="#7dd3fc" />
              <Text style={styles.eyebrow}>Friends</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{friends.length} friends</Text>
            </View>
          </View>
          <Text style={styles.header}>Find Your People</Text>
          <Text style={styles.subtitle}>
            Add friends, accept invites, and grow together.
          </Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>To You</Text>
              <Text style={styles.metricValue}>{incoming.length}</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Pending</Text>
              <Text style={styles.metricValue}>{outgoing.length}</Text>
            </View>
          </View>
        </LinearGradient>

        {!!error ? (
          <View style={styles.errorCard}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <SectionCard
          title="Your Handle"
          subtitle="Pick a username friends can find."
        >
          <View style={styles.inlineRow}>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              value={usernameInput}
              onChangeText={setUsernameInput}
            />
            <TouchableOpacity
              style={[styles.primaryButton, busy ? styles.disabled : null]}
              onPress={updateUsername}
              disabled={busy}
            >
              <Text style={styles.primaryText}>Save</Text>
            </TouchableOpacity>
          </View>
          {!!myProfile?.username ? (
            <Text style={styles.smallText}>Current: @{myProfile.username}</Text>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Find People"
          subtitle="Search usernames and send a quick invite."
        >
          <View style={styles.inlineRow}>
            <TextInput
              style={styles.input}
              placeholder="Search username"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={[styles.primaryButton, busy ? styles.disabled : null]}
              onPress={runSearch}
              disabled={busy}
            >
              <Search size={14} color="#dbeafe" />
              <Text style={styles.primaryText}>Search</Text>
            </TouchableOpacity>
          </View>

          {searchResults.map((item, index) => (
            <UserRow
              key={item.user_id}
              username={item.username}
              subtitle={relationLabel(item.relation)}
              rowStyle={index === searchResults.length - 1 ? styles.lastRow : null}
              rightNode={
                item.relation === "none" ? (
                  <TouchableOpacity
                    style={[styles.actionButton, busy ? styles.disabled : null]}
                    onPress={() => requestFriend(item.username)}
                    disabled={busy}
                  >
                    <UserRoundPlus size={13} color="#dcfce7" />
                    <Text style={styles.actionText}>Add Friend</Text>
                  </TouchableOpacity>
                ) : item.relation === "incoming_pending" ? (
                  <TouchableOpacity
                    style={[styles.actionButton, busy ? styles.disabled : null]}
                    onPress={() => acceptRequest(item.friendship_id)}
                    disabled={busy}
                  >
                    <Text style={styles.actionText}>Accept</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>
                      {item.relation === "friend" ? "In Circle" : "Pending"}
                    </Text>
                  </View>
                )
              }
            />
          ))}
          {!searchResults.length && searchQuery.trim().length >= 2 ? (
            <Text style={styles.emptyText}>No users found.</Text>
          ) : null}
        </SectionCard>

        <SectionCard title="Incoming Requests">
          {incoming.map((item, index) => (
            <UserRow
              key={item.friendship_id}
              username={item.username}
              subtitle="Wants to be friends"
              rowStyle={index === incoming.length - 1 ? styles.lastRow : null}
              rightNode={
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, busy ? styles.disabled : null]}
                    onPress={() => acceptRequest(item.friendship_id)}
                    disabled={busy}
                  >
                    <Text style={styles.actionText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, busy ? styles.disabled : null]}
                    onPress={() => declineRequest(item.friendship_id)}
                    disabled={busy}
                  >
                    <Text style={styles.secondaryText}>Not now</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          ))}
          {!incoming.length ? <Text style={styles.emptyText}>No incoming requests.</Text> : null}
        </SectionCard>

        <SectionCard title="Outgoing Requests">
          {outgoing.map((item, index) => (
            <UserRow
              key={item.friendship_id}
              username={item.username}
              subtitle="Waiting for reply"
              rowStyle={index === outgoing.length - 1 ? styles.lastRow : null}
              rightNode={
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Pending</Text>
                </View>
              }
            />
          ))}
          {!outgoing.length ? <Text style={styles.emptyText}>No outgoing requests.</Text> : null}
        </SectionCard>

        <SectionCard title="Your Circle">
          {friends.map((item, index) => (
            <UserRow
              key={item.friendship_id}
              username={item.username}
              subtitle="In your circle"
              rowStyle={index === friends.length - 1 ? styles.lastRow : null}
              rightNode={
                <TouchableOpacity
                  style={[styles.secondaryButton, busy ? styles.disabled : null]}
                  onPress={() => removeFriendAction(item.user_id)}
                  disabled={busy}
                >
                  <Text style={styles.secondaryText}>Remove</Text>
                </TouchableOpacity>
              }
            />
          ))}
          {!friends.length ? <Text style={styles.emptyText}>No friends yet. Start with search above.</Text> : null}
        </SectionCard>
      </ScrollView>
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
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  eyebrow: {
    color: "#7dd3fc",
    fontSize: moderateScale(11),
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  countPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  countPillText: {
    color: "#cbd5e1",
    fontSize: moderateScale(11),
    fontWeight: "700",
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
    marginBottom: verticalScale(10),
  },
  metricsRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  metricPill: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: moderateScale(10),
  },
  metricValue: {
    color: "#dbeafe",
    fontSize: moderateScale(13),
    fontWeight: "700",
    marginTop: verticalScale(1),
  },
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
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: scale(14),
    marginBottom: verticalScale(12),
  },
  cardTitle: {
    fontSize: moderateScale(15),
    fontWeight: "800",
    color: "#e2e8f0",
    marginBottom: verticalScale(4),
  },
  cardHint: {
    fontSize: moderateScale(11),
    color: "#94a3b8",
    marginBottom: verticalScale(8),
  },
  inlineRow: {
    flexDirection: "row",
    gap: scale(8),
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(9),
    fontSize: moderateScale(12),
    color: "#f8fafc",
  },
  smallText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(11),
    color: "#94a3b8",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    paddingVertical: verticalScale(9),
    gap: scale(8),
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  rowTextWrap: {
    flex: 1,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  avatar: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#2563eb",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#bfdbfe",
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  rowTitle: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#e2e8f0",
  },
  rowSub: {
    fontSize: moderateScale(11),
    color: "#94a3b8",
    marginTop: verticalScale(2),
  },
  actionsRow: {
    flexDirection: "row",
    gap: scale(6),
    alignItems: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#2563eb",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
  },
  primaryText: {
    color: "#dbeafe",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#15803d",
    borderWidth: 1,
    borderColor: "#15803d",
    borderRadius: 10,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
  },
  actionText: {
    color: "#dcfce7",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
  },
  secondaryText: {
    color: "#cbd5e1",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  pill: {
    backgroundColor: "#111827",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  pillText: {
    color: "#cbd5e1",
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: moderateScale(12),
    marginTop: verticalScale(8),
  },
  disabled: {
    opacity: 0.55,
  },
});
