import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function UserDetail() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const routere = router;

  const loadUser = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");

    const res = await axios.get(
      `http://192.168.31.81:5000/admin/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUser(res.data);
  } catch (err) {
    console.log("Load user error");
  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
        setLoading(true);
        loadUser();
    }, [userId]);

const toggleStatus = async () => {
    if (!user || !user.user ||!user.user.user_id) return;

    console.log("Toggle status fired");

    const isActive = Number(user.user.is_active)===1;
    const actionText = isActive ? "Suspend" : "Activate";
    const confirmText = isActive ? "suspend" : "activate";

    Alert.alert(
        `${actionText} User`,
        `Are you sure you want to ${confirmText} ${user?.name || "this user"}?`,
        [
            { text: "Cancel", style: "cancel" },
            {
                text: actionText,
                style: isActive ? "destructive" : "default",
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync("token");

                        await axios.put(
                            `http://192.168.31.81:5000/admin/users/${user.user.user_id}/status`,
                            {
                                is_active: user.user.is_active ? 0 : 1
                            },
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );

                        loadUser(); // refresh after change
                    } catch (err: any) {
                        Alert.alert(
                            "Error",
                            err.response?.data?.error || "Something went wrong"
                        );
                    }
                },
            },
        ]
    );
};

  // 🔥 SAFE RENDER GUARDS
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
  <ScreenContainer>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Profile Card */}
      <Card>
        <Text style={styles.userName}>{user.user.name}</Text>
        <Text style={styles.userMeta}>{user.user.email}</Text>
        <Text style={styles.userMeta}>{user.user.phone}</Text>

        <View style={styles.badgeRow}>
          <Text style={styles.roleBadge}>
            {user.user.role}
          </Text>

          <Text
            style={[
              styles.statusBadge,
              {
                backgroundColor: user.user.is_active
                  ? "#16A34A"
                  : "#DC2626",
              },
            ]}
          >
            {user.user.is_active ? "Active" : "Suspended"}
          </Text>
        </View>
      </Card>

      {/* Action Button */}
      {user.user.role !== "admin" && (
        <PrimaryButton
          title={user.user.is_active ? "Suspend User" : "Activate User"}
          onPress={toggleStatus}
        />
      )}

      {/* Cars Section */}
      <Text style={styles.sectionTitle}>Cars</Text>

      {user.cars.length === 0 && (
        <Text style={styles.emptyText}>No cars added</Text>
      )}

      {user.cars.map((car: any) => (
        <TouchableOpacity
          key={car.car_id}
          activeOpacity={0.8}
          onPress={() =>
            router.push(`/admin-car-calendar?userId=${user.user.user_id}&carId=${car.car_id}`
            //   {
            //   pathname: "/admin-car-calendar",
            //   params: {
            //     userId: user.user.user_id,
            //     carId: car.car_id,
            //   },
            // }
          )
          }
        >
          <Card>
            <Text style={styles.carTitle}>
              {car.make} {car.model}
            </Text>
            <Text style={styles.carMeta}>
              {car.registration_number}
            </Text>
            <Text style={styles.carMeta}>{car.area}</Text>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Subscription Section */}
      <Text style={styles.sectionTitle}>Active Subscription</Text>

      {!user.subscription && (
        <Text style={styles.emptyText}>No active subscription</Text>
      )}

      {user.subscription && (
        <Card>
          <Text style={styles.subTitle}>
            {user.subscription.subscription_type}
          </Text>
          <Text style={styles.carMeta}>
            Start: {user.subscription.start_date}
          </Text>
          <Text style={styles.carMeta}>
            Status: {user.subscription.status}
          </Text>
        </Card>
      )}
    </ScrollView>
  </ScreenContainer>
);
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
    color: "#111827",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  userMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  roleBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    fontSize: 12,
    textTransform: "capitalize",
  },
  statusBadge: {
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  carMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyText: {
    color: "#6B7280",
    marginBottom: 12,
  },
});