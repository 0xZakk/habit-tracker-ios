import { StyleSheet, View, TextInput, Pressable, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { habitService } from "@/src/lib/habitService";
import { useAuth } from "@/src/lib/AuthContext";

export default function NewHabitScreen() {
  const insets = useSafeAreaInsets();
  const [habitName, setHabitName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useAuth();

  const handleSubmit = async () => {
    if (!habitName.trim() || isSubmitting) return;
    if (!session) {
      Alert.alert("Error", "You must be signed in to create habits");
      router.replace("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      const newHabit = await habitService.createHabit({
        name: habitName.trim(),
        createdAt: new Date(),
      });

      if (newHabit) {
        // Navigate back to home screen
        router.push("/)");
        setHabitName(""); // Reset the input
      }
    } catch (error) {
      console.error("Failed to create habit:", error);
      Alert.alert("Error", "Failed to create habit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ThemedText type="title" style={styles.title}>
        Add New Habit
      </ThemedText>

      <View style={styles.form}>
        <ThemedText style={styles.label}>
          What habit would you like to build?
        </ThemedText>
        <TextInput
          style={styles.input}
          value={habitName}
          onChangeText={setHabitName}
          placeholder="Enter habit name"
          placeholderTextColor="#666"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!isSubmitting}
        />

        <Pressable
          style={[
            styles.button,
            (!habitName.trim() || isSubmitting) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!habitName.trim() || isSubmitting}
        >
          <ThemedText style={styles.buttonText}>
            {isSubmitting ? "Creating..." : "Create Habit"}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: 30,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    color: "#000",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
