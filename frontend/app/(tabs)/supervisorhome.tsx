import { useState, useCallback } from "react";
import { View, Text, FlatList, Button, Alert, Image, StyleSheet } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router, useFocusEffect } from "expo-router";
import {Modal, TouchableOpacity} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function SupervisorHome() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const BaseUrl = "http://192.168.31.81:5000";

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      // Dashboard counts
      const dash = await axios.get(
        "http://192.168.31.81:5000/supervisor/dashboard",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCounts(dash.data);

      // Pending approvals
      const res = await axios.get(
        "http://192.168.31.81:5000/supervisor/pending-approvals",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobs(res.data.pending_approvals);
    } catch (err: any) {
      console.log(err?.response?.data || err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const takeDecision = async (wash_entry_id: number, decision: string) => {
    try {
      const token = await SecureStore.getItemAsync("token");

      await axios.post(
        "http://192.168.31.81:5000/supervisor/decision",
        { wash_entry_id, decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const message =
        decision === "approve"
          ? "Wash entry approved successfully"
          : "Wash entry rejected successfully";

      Alert.alert(message);
      fetchData();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Failed");
    }
  };
  const handleLogout = async () => {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("role");
      router.replace("/");
    };

  return (

    <SafeAreaView style={{ flex: 1, padding: 4}} edges= {["top"]}>
      <View style={styles.header}>
        <Text style={styles.heading}>Supervisor Panel</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard */}
      <Text>Pending Wash: {counts.pending_for_wash}</Text>
      <Text>Pending Approval: {counts.pending_approval}</Text>
      <Text>Approved Washed: {counts.approved_washed}</Text>
      <Text>Approved Not Washed: {counts.approved_not_washed}</Text>

      <Text style={{ marginTop: 20, fontSize: 18 }}>
        Pending Approvals
      </Text>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.wash_entry_id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              padding: 12,
              borderRadius: 10,
              marginVertical: 8,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.customer_name}</Text>
            <Text>{item.car}</Text>
            <Text>{item.registration_number}</Text>
            <Text>{item.area}</Text>
            <Text>Action: {item.action}</Text>

            {item.reason_code && <Text>Reason: {item.reason_code}</Text>}
            {item.note && <Text>Note: {item.note}</Text>}

            {item.proof_image && (
                    <TouchableOpacity
                        onPress={() =>
                            setPreviewImage(`${BaseUrl}/${item.proof_image}`)
                        }
                    >
                        <Image
                            source={{
                                uri: `${BaseUrl}/${item.proof_image}`,
                            }}
                            style={{ height: 120, marginVertical: 10, borderRadius: 8 }}
                        />
                    </TouchableOpacity>
            )}

            <Button
              title="Approve"
              onPress={() => takeDecision(item.wash_entry_id, "approve")}
            />
            <Button
              title="Reject"
              color="red"
              onPress={() => takeDecision(item.wash_entry_id, "reject")}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
          <Modal visible={!!previewImage} transparent={true}>
              <TouchableOpacity
                  style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.9)",
                      justifyContent: "center",
                      alignItems: "center",
                  }}
                  onPress={() => setPreviewImage(null)}
              >
                  {previewImage && (
                      <Image
                          source={{ uri: previewImage }}
                          style={{
                              width: "95%",
                              height: "80%",
                              resizeMode: "contain",
                          }}
                      />
                  )}

                  <Text style={{ color: "white", marginTop: 20 }}>
                      Tap anywhere to close
                  </Text>
              </TouchableOpacity>
          </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    alignSelf: "flex-end",
  },

  logoutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
  },
});
