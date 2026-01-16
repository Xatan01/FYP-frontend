import React, { useState } from "react";
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
import { MessageSquareText, Plus } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import usePersistedState from "../hooks/usePersistedState";

const starterPosts = [
  {
    id: "p1",
    author: "Divya G.",
    topic: "REITs",
    text: "Anyone holding Mapletree this quarter?",
    replies: 12,
  },
  {
    id: "p2",
    author: "Xavier T.",
    topic: "Banks",
    text: "DBS earnings looked strong. Thoughts?",
    replies: 7,
  },
];

export default function Community() {
  const {
    value: posts,
    setValue: setPosts,
    loading,
    error,
  } = usePersistedState("communityPosts", starterPosts);
  const [newPost, setNewPost] = useState("");

  const handleAddPost = () => {
    if (!newPost.trim()) return;
    const next = {
      id: `p-${Date.now()}`,
      author: "You",
      topic: "General",
      text: newPost.trim(),
      replies: 0,
    };
    setPosts([next, ...posts]);
    setNewPost("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading community...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ padding: scale(16) }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Community Forum</Text>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.newPost}>
            <TextInput
              style={styles.input}
              placeholder="Share a thought or ask a question"
              placeholderTextColor="#94a3b8"
              value={newPost}
              onChangeText={setNewPost}
            />
            <TouchableOpacity style={styles.postButton} onPress={handleAddPost}>
              <Plus size={16} color="#fff" />
              <Text style={styles.postText}>Post</Text>
            </TouchableOpacity>
          </View>

          {posts.map((post) => (
            <View key={post.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <MessageSquareText size={16} color="#2563eb" />
                <Text style={styles.author}>{post.author}</Text>
                <Text style={styles.topic}>{post.topic}</Text>
                <Text style={styles.replies}>{post.replies} replies</Text>
              </View>
              <Text style={styles.body}>{post.text}</Text>
            </View>
          ))}
          {posts.length === 0 && (
            <Text style={styles.emptyState}>No posts yet. Start a thread.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
  },
  loadingText: { color: "#64748b", fontSize: moderateScale(12) },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: verticalScale(12),
  },
  error: {
    color: "#dc2626",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  newPost: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(12),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(12),
  },
  input: {
    minHeight: verticalScale(60),
    fontSize: moderateScale(13),
    color: "#0f172a",
  },
  postButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginTop: verticalScale(8),
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
  },
  postText: { color: "#fff", fontSize: moderateScale(12), fontWeight: "600" },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(12),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginBottom: verticalScale(6),
  },
  author: { fontSize: moderateScale(12), fontWeight: "700", color: "#0f172a" },
  topic: {
    fontSize: moderateScale(11),
    color: "#2563eb",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: 999,
  },
  replies: { marginLeft: "auto", fontSize: moderateScale(11), color: "#64748b" },
  body: { fontSize: moderateScale(13), color: "#334155" },
  emptyState: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: moderateScale(12),
    marginTop: verticalScale(12),
  },
});
