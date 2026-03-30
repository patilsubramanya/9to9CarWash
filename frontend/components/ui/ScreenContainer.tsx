import { View, StyleSheet } from "react-native";

export default function ScreenContainer({ children }: any) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // modern SaaS soft gray
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});