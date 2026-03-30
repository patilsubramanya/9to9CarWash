import { View, Text, StyleSheet } from "react-native";

export default function StatusBadge({ status }: { status: string }) {
  const getColor = () => {
    switch (status) {
      case "approved_washed":
        return "#16A34A";
      case "approved_not_washed":
        return "#DC2626";
      case "PENDING":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      <Text style={styles.text}>{status.replaceAll("_", " ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});