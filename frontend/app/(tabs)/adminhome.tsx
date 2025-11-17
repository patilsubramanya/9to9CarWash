import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text, TextInput, Card, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";

export default function AdminHome() {
  const { token } = useLocalSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://192.168.0.105:5000/admin/users?q=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Admin Dashboard
      </Text>

      <TextInput
        placeholder="Search by name"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
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
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.name}>{item.name}</Text>
                <Text
                style={styles.phone}
                onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                    📞 {item.phone}
                </Text>
                <Text style={{ marginTop: 5 }}>
                  🚗 Cars: {item.cars.length > 0 ? item.cars.join(", ") : "None"}
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    marginBottom: 15,
    fontWeight: "bold",
  },
  phone: {
    color: "#007bff",
    textDecorationLine: "underline",
    marginTop: 3,
  },
  search: {
    marginBottom: 15,
    backgroundColor: "#f2f2f2",
  },
  card: {
    marginBottom: 10,
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
  },
});
