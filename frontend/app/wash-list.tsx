import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Modal} from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Card from "@/components/ui/Card";

export default function WashList() {

  const { status } = useLocalSearchParams();
  const [entries, setEntries] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadData = async () => {
    const token = await SecureStore.getItemAsync("token");

    const res = await axios.get(
      `http://192.168.31.81:5000/admin/wash-entries?status=${status}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setEntries(res.data.entries);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.heading}>{status} Jobs</Text>

      {entries.map((item) => (
        <Card key={item.wash_entry_id} style={{ marginBottom: 12 }}>
          <Text style={styles.name}>{item.customer_name}</Text>
          <Text>Date: {item.wash_date}</Text>
          <Text>{item.phone}</Text>
          <Text>{item.car}</Text>
          <Text>{item.registration_number}</Text>
          <Text>{item.status}</Text>
          <Text>{item.reason && `Reason: ${item.reason}` }</Text>
              {item.proof_image && (
                <TouchableOpacity
                  onPress={() =>
                    setPreviewImage(`http://192.168.31.81:5000/${item.proof_image}`)
                  }
                >
                  <Image
                      source={{ uri: `http://192.168.31.81:5000/${item.proof_image}` }}
                      style={styles.proof_Image} resizeMode="cover" />
                </TouchableOpacity>
              )}
        </Card>
      ))}
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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20
  },
  proof_Image: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 12
  },
  name: {
    fontSize: 16,
    fontWeight: "600"
  }
});