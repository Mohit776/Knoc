import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";

const Row = ({
  label,
  value,
  showEdit,
  isEditing,
  onEditPress,
  onChangeText,
  editableValue,
  saving,
}: {
  label: string;
  value: string;
  showEdit?: boolean;
  isEditing?: boolean;
  onEditPress?: () => void;
  onChangeText?: (text: string) => void;
  editableValue?: string;
  saving?: boolean;
}) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={editableValue}
          onChangeText={onChangeText}
          autoFocus
        />
      ) : (
        <Text style={styles.value}>{value || "Not Provided"}</Text>
      )}
    </View>

    {showEdit && (
      <TouchableOpacity onPress={onEditPress} disabled={saving}>
        {saving ? (
          <ActivityIndicator size="small" color="#5b5cff" />
        ) : (
          <Text style={styles.edit}>{isEditing ? "Save" : "Edit"}</Text>
        )}
      </TouchableOpacity>
    )}
  </View>
);

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const qrId = await AsyncStorage.getItem("linked_qr_id");
      const guestPhone = await AsyncStorage.getItem("guest_phone");
      
      setMobile(guestPhone ? `+91 ${guestPhone.replace('+91', '').trim()}` : "");

      if (qrId) {
        const docSnap = await firestore().collection("qr_codes").doc(qrId).get();
        const data = docSnap.data();
        if (data) {
          setName(data.name || "");
          if (data.phone_number) {
            setMobile(data.phone_number);
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNameClick = async () => {
    if (isEditingName) {
      // Save it
      if (!editableName.trim()) {
        Alert.alert("Error", "Name cannot be empty");
        return;
      }

      setSaving(true);
      try {
        const qrId = await AsyncStorage.getItem("linked_qr_id");
        if (qrId) {
          await firestore().collection("qr_codes").doc(qrId).update({
            name: editableName.trim(),
          });
          await AsyncStorage.setItem("user_name", editableName.trim());
          setName(editableName.trim());
          setIsEditingName(false);
        } else {
          Alert.alert("Error", "No registered KNOC found. Please set up a KNOC first.");
        }
      } catch (error) {
        console.error("Error saving name:", error);
        Alert.alert("Error", "Failed to save name.");
      } finally {
        setSaving(false);
      }
    } else {
      // Start editing
      setEditableName(name);
      setIsEditingName(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Your profile</Text>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Personal details</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4B1FAF" style={{ marginTop: 40 }} />
      ) : (
        /* Card */
        <View style={styles.card}>
          <Row 
            label="Name" 
            value={name} 
            showEdit={true} 
            isEditing={isEditingName}
            editableValue={editableName}
            onChangeText={setEditableName}
            onEditPress={handleEditNameClick}
            saving={saving}
          />
          <Row 
            label="Mobile" 
            value={mobile} 
            showEdit={false} 
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  sectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  
  rowLeft: {
    flex: 1,
    marginRight: 10,
  },

  label: {
    fontSize: 12,
    color: "#888",
  },

  value: {
    fontSize: 14,
    color: "#000",
    marginTop: 2,
  },
  
  input: {
    fontSize: 14,
    color: "#000",
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#5b5cff",
    paddingVertical: 0,
  },

  edit: {
    color: "#5b5cff",
    fontWeight: "500",
  },
});