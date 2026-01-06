import { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Linking } from "react-native";
import { Text, TextInput, Card, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function AdminHome() {
  const { token } = useLocalSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://192.168.31.140:5000/admin/users?q=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(res.data.users);
    } catch (err: any) {
      console.log("Admin fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers(); // Auto refresh when page comes into focus
    }, [token])
  );

  return (
    <View style={styles.page}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Dashboard</Text>
      </View>

      {/* Search input */}
      <TextInput
        placeholder="Search users..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        mode="outlined"
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          onRefresh={fetchUsers}
          refreshing={loading}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card} elevation={3}>
              <Card.Content>
                <Text style={styles.name}>{item.name}</Text>

                <Text
                  style={styles.phone}
                  onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                  {item.phone}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.carTitle}>Cars:</Text>
                <Text style={styles.carList}>
                  {item.cars.length > 0
                    ? item.cars.join(", ")
                    : "No Cars Added"}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#e6e6e6",
    padding: 12,
  },

  header: {
    backgroundColor: "#007bff",
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
  },
  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  search: {
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 5,
    marginBottom: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },

  phone: {
    fontSize: 16,
    color: "#007bff",
    textDecorationLine: "underline",
    marginBottom: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },

  carTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 3,
  },

  carList: {
    color: "#555",
    fontSize: 15,
    marginBottom: 5,
  },
});
