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
import { Typography, s, vs, ms, Spacing, VSpacing, Radius, IconSize, FontFamily } from "../lib/typography";

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
          <Ionicons name="arrow-back" size={IconSize.md} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      {/* Section title */}
      <Text style={styles.sectionTitle}>Notification Appearances</Text>

      {/* Card */}
      <View style={styles.card}>
        <Row
          icon={<Ionicons name="logo-whatsapp" size={IconSize.sm} color="#000" />}
          label="WhatsApp"
          value={whatsappEnabled}
          onChange={setWhatsappEnabled}
        />

        <Row
          icon={<MaterialIcons name="sms" size={IconSize.sm} color="#000" />}
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
    paddingHorizontal: Spacing.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(10),
    paddingVertical: VSpacing.sm,
  },

  headerTitle: {
    ...Typography.title,
    fontFamily: FontFamily.semiBold,
  },

  sectionTitle: {
    marginTop: VSpacing.lg,
    marginBottom: vs(10),
    ...Typography.label,
    fontFamily: FontFamily.medium,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: Radius.lg,
    paddingVertical: VSpacing.xs,
    paddingHorizontal: Spacing.sm,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: VSpacing.md,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(10),
  },

  iconBox: {
    width: s(34),
    height: s(34),
    borderRadius: Radius.md,
    backgroundColor: "#EDE7FF",
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.medium,
  },
});