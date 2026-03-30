import { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, FlatList, Button, Alert, Modal, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
export default function WasherHome() {
  const [jobs, setJobs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState<any>(null);
  const intervalRef = useRef<any>(null);



  const fetchJobs = async () => {
    try {
    const token = await SecureStore.getItemAsync("token");
    const role = await SecureStore.getItemAsync("role");

    console.log("FETCHING JOBS");
    console.log("ROLE:", role);
    console.log("TOKEN:", token?.substring(0, 20));

    const res = await axios.get(
      "http://192.168.31.81:5000/washer/today-jobs",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("RESPONSE:", res.data);

    setJobs(res.data.jobs);
  } catch (err: any) {
    console.log("ERROR:", err?.response?.data || err.message);
    setJobs([]);
  }
};

    useFocusEffect(
        useCallback(() => {
            fetchJobs(); // load immediately

            intervalRef.current = setInterval(fetchJobs, 5000); // auto refresh

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current); // STOP when leaving screen
                }
            };
        }, [])
    );

    const pickImage = async () => {
        // Ask camera permission
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
            Alert.alert("Permission required", "Camera permission is needed");
            return;
        }

        // Ask media library permission (for preview saving)
        const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!mediaPerm.granted) {
            Alert.alert("Permission required", "Gallery permission is needed");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
            allowsEditing: false,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

  const markWashed = async (wash_entry_id: number) => {
    try {
      const token = await SecureStore.getItemAsync("token");

      await axios.post(
        "http://192.168.31.81:5000/washer/update-status",
        {
          wash_entry_id: wash_entry_id,
          action: "washed",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Marked as washed");

      // Refresh list after update
      await fetchJobs();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Failed");
    }
  };
  
const submitNotWashed = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");

    const formData = new FormData();
    formData.append("wash_entry_id", selectedJob.wash_entry_id.toString());
    formData.append("action", "not_washed");
    formData.append("reason_code", reason);

    if (note) formData.append("note", note);

    if (image) {
      formData.append("proof_image", {
        uri: image.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
    }

    await axios.post(
      "http://192.168.31.81:5000/washer/update-status",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setModalVisible(false);
    setReason("");
    setNote("");
    setImage(null);

    await fetchJobs();
  } catch (err: any) {
    Alert.alert("Error", err?.response?.data?.error || "Failed");
  }
};

const handleLogout = async () => {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("role");
      router.replace("/");
    };

  const reasons = [
  "CUSTOMER_DENIED",
  "CAR_NOT_AVAILABLE",
  "GATE_LOCKED",
  "NO_WATER",
  "BAD_WEATHER",
  "OTHER",
];

  return (
    
    <SafeAreaView style={{ flex: 1, padding: 4 }} edges= {["top"]}>
      <View style={styles.header}>
        <Text style={styles.heading}>Washer Panel</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Today's Cars To Wash
      </Text>

      <FlatList
        data={jobs}
        keyExtractor={(item: any) => item.wash_entry_id.toString()}
        renderItem={({ item }: any) => (
          <View style={{ 
            marginBottom: 20,
            padding: 15,
            borderWidth: 1,
            // borderColor: "#ccc",
            borderRadius: 10,
          }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {item.customer_name}
            </Text>
            <Text>{item.car}</Text>
            <Text>{item.registration_number}</Text>
            <Text>{item.area}</Text>
            <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
              <Button
                title="Mark Washed"
                onPress={() => markWashed(item.wash_entry_id)}
              />
            <View style={{ flex: 1 }}>
                <Button title="Mark Not Washed" color="red" onPress={() => {
                    setSelectedJob(item);
                    setModalVisible(true);
                }} />
            </View>
          </View>
        </View>
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
          <Modal visible={modalVisible} animationType="slide">
              <View style={{ padding: 20, marginTop: 40 }}>
                  <Text style={{ fontSize: 20, marginBottom: 10 }}>Not Washed Reason</Text>

                  {reasons.map((r) => (
                      <TouchableOpacity key={r} onPress={() => setReason(r)}>
                          <Text
                              style={{
                                  padding: 10,
                                  backgroundColor: reason === r ? "#ddd" : "#fff",
                              }}
                          >
                              {r}
                          </Text>
                      </TouchableOpacity>
                  ))}

                  {reason === "OTHER" && (
                      <TextInput
                          placeholder="Enter note"
                          value={note}
                          onChangeText={setNote}
                          style={{ borderWidth: 1, marginTop: 10, padding: 10 }}
                      />
                  )}

                  <Button title="Upload Photo" onPress={pickImage} />

                  {image && (
                      <Image source={{ uri: image.uri }} style={{ height: 120, marginTop: 10 }} />
                  )}

                  <View style={{ height: 20 }} />

                  <Button title="Submit" onPress={submitNotWashed} />
                  <Button title="Cancel" onPress={() => setModalVisible(false)} />
              </View>
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
