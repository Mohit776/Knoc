import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const NotificationScreen: React.FC = () => {
  const router = useRouter();
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  const Row = ({
    icon,
    label,
    value,
    onChange,
  }: {
    icon: React.ReactNode;
    label: string;
    value: boolean;
    onChange: (val: boolean) => void;
  }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#ccc", true: "#5A35D6" }}
        thumbColor={"#fff"}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      {/* Section title */}
      <Text style={styles.sectionTitle}>Notification Appearances</Text>

      {/* Card */}
      <View style={styles.card}>
        <Row
          icon={<Ionicons name="logo-whatsapp" size={18} color="#000" />}
          label="WhatsApp"
          value={whatsappEnabled}
          onChange={setWhatsappEnabled}
        />

        <Row
          icon={<MaterialIcons name="sms" size={18} color="#000" />}
          label="SMS"
          value={smsEnabled}
          onChange={setSmsEnabled}
        />
      </View>
    </SafeAreaView>
  );
};

export default NotificationScreen;

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
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#EDE7FF",
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});