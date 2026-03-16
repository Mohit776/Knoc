import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";

const InputField = ({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      placeholder="Enter here"
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
    />
  </View>
);

const AddressScreen: React.FC = () => {
  const router = useRouter();
  const [house, setHouse] = useState("");
  const [apartment, setApartment] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadExistingAddress();
  }, []);

  const loadExistingAddress = async () => {
    try {
      const qrId = await AsyncStorage.getItem("linked_qr_id");
      if (qrId) {
        const docSnap = await firestore().collection("qr_codes").doc(qrId).get();
        const data = docSnap.data();
        if (data?.addressDetails) {
          setHouse(data.addressDetails.house || "");
          setApartment(data.addressDetails.apartment || "");
          setPincode(data.addressDetails.pincode || "");
          setLandmark(data.addressDetails.landmark || "");
        }
      }
    } catch (error) {
      console.error("Error loading address:", error);
    } finally {
      setFetching(false);
    }
  };

  const saveAddress = async () => {
    if (!house) {
      Alert.alert("Error", "Please enter the house/flat/floor no.");
      return;
    }

    setLoading(true);
    try {
      const qrId = await AsyncStorage.getItem("linked_qr_id");
      if (!qrId) {
        Alert.alert("Error", "No registered KNOC found. Please set up a KNOC first.");
        setLoading(false);
        return;
      }

      // Format a fallback single string representing the full address
      const fullAddressParts = [house, apartment, landmark, pincode].filter(Boolean);
      const fullAddress = fullAddressParts.join(", ");

      await firestore().collection("qr_codes").doc(qrId).update({
        location: fullAddress, // This allows the Home/Settings screens to still read a general location string
        addressDetails: {
          house: house.trim(),
          apartment: apartment.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim(),
        }
      });

      Alert.alert("Success", "Address updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert("Error", "Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address</Text>
      </View>

      {/* Title */}
      <Text style={styles.sectionTitle}>Change Address</Text>

      {fetching ? (
        <ActivityIndicator size="large" color="#4B1FAF" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Form Card */}
          <View style={styles.card}>
            <InputField
              label="House/flat/floor no."
              value={house}
              onChangeText={setHouse}
            />

            <InputField
              label="Apartment/road/area"
              value={apartment}
              onChangeText={setApartment}
            />

            <InputField
              label="Pincode"
              value={pincode}
              onChangeText={setPincode}
            />

            <InputField
              label="Landmark"
              value={landmark}
              onChangeText={setLandmark}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={saveAddress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save address details</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },

  inputContainer: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  button: {
    marginTop: 20,
    backgroundColor: "#4B1FAF",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});