import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const AboutScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About us</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>About us</Text>

        {/* Description */}
        <Text style={styles.text}>
          TrueKnoc is India's first QR code-based smart doorbell that works
          without electricity. Our app is revolutionizing how Indian families
          manage home security and visitor access. You can now manage your home
          visitors seamlessly with instant notifications, remote access, and
          complete visitor logs – all without worrying about power cuts or
          expensive installations.
        </Text>

        <Text style={styles.text}>
          Imagine never missing an important delivery again. Your child's tutor
          arriving while you're stuck in traffic. An urgent package that needs
          your signature. Even when the power is out. Our electricity-free
          doorbell system helps homeowners in India save money, time, and never
          miss a visitor in a way that's effortless.
        </Text>

        <Text style={styles.text}>
          We make smart, reliable, and affordable home security available to
          everyone instantly so that people can have peace of mind for the
          things that matter to them.
        </Text>

        <Text style={styles.text}>
          'TrueKnoc' is owned & operated by 'Rewato Marketplace Private Limited'
          and is committed to making smart home security accessible and
          affordable for every Indian household.
        </Text>

        {/* Company Info */}
        <Text style={styles.info}>
          Company Registration Number (CIN): U62099DL2025PTC459490
        </Text>

        <Text style={styles.info}>
          Registered Office:{"\n"}
          A1816, 18th Floor, Tower A Spectrum Mall, Sector 75 Noida,{"\n"}
          Uttar Pradesh 201301, India
        </Text>

        {/* Contact */}
        <Text style={styles.contactTitle}>For any queries, reach us at:</Text>

        <Text style={styles.contact}>📧 Email: support@trueknoc.in</Text>
        <Text style={styles.contact}>📞 Phone: +91 9098493807</Text>

        {/* Developer Info */}
        <View style={styles.developerSection}>
          <Text style={styles.developerText}>Developed by: Mohit Aggarwal</Text>
          <Text style={styles.developerContact}>Contact: mohitaggarwal551@gmail.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;

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

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
  },

  text: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    marginBottom: 12,
  },

  info: {
    fontSize: 13,
    color: "#444",
    marginBottom: 12,
  },

  contactTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
  },

  contact: {
    fontSize: 13,
    marginTop: 4,
    color: "#444",
  },
  
  developerSection: {
    marginTop: 30,
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  developerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5f259f",
    marginBottom: 4,
  },
  developerContact: {
    fontSize: 13,
    color: "#444",
  },
});