import React, { useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import LottieView from "lottie-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

// Free Lottie animation for confetti
const LOTTIE_CONFETTI = "https://lottie.host/5a07231d-d47b-486a-8b7a-115f01e1490d/U9YmADb8P3.json";

export default function LessonCompleteModal({ visible, onClose, xp }) {
  const confettiRef = useRef(null);

  useEffect(() => {
    if (visible) {
      confettiRef.current?.play(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalView}>
          <LottieView
            ref={confettiRef}
            source={{ uri: LOTTIE_CONFETTI }}
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.modalTitle}>Lesson Complete!</Text>
          <Text style={styles.modalSubtitle}>You earned +{xp} XP</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: scale(20),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  lottie: {
    width: "100%",
    height: scale(150),
    position: "absolute",
    top: -scale(30),
  },
  modalTitle: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: scale(100), // Make space for lottie
  },
  modalSubtitle: {
    fontSize: moderateScale(16),
    color: "#16a34a",
    fontWeight: "600",
    marginVertical: verticalScale(8),
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 20,
    paddingVertical: scale(12),
    paddingHorizontal: scale(30),
    elevation: 2,
    marginTop: verticalScale(12),
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: moderateScale(14),
  },
});