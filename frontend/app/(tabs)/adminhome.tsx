import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function AdminHome() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState("washer");
  const [creating, setCreating] = useState(false);

  const fetchDashboard = async (token: string) => {
    const res = await axios.get(
      "http://192.168.31.81:5000/admin/dashboard",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDashboard(res.data);
  };
  console.log("Dashboard data:", dashboard);

  const fetchUsers = async (token: string) => {
    const res = await axios.get(
      `http://192.168.31.81:5000/admin/users?q=${search}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setUsers(res.data.users);
  };

  const loadData = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;

      await fetchDashboard(token);
      await fetchUsers(token);
    } catch (err: any) {
      console.log("Admin load error:", err.response?.data || err.message);
    }
  }, [search]);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("role");
    router.replace("/");
  };

  const createStaff = async () => {
    if (!staffName || !staffEmail || !staffPhone || !staffPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setCreating(true);
      const token = await SecureStore.getItemAsync("token");

      await axios.post(
        "http://192.168.31.81:5000/admin/create-staff",
        {
          name: staffName,
          email: staffEmail,
          phone: staffPhone,
          password: staffPassword,
          role: staffRole,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Staff created successfully");

      setStaffName("");
      setStaffEmail("");
      setStaffPhone("");
      setStaffPassword("");
      setStaffRole("washer");
      setModalVisible(false);

      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScreenContainer>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.heading}>Admin Dashboard</Text>
                <Text style={styles.subHeading}>System Overview</Text>
              </View>

              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {dashboard && (
              <View style={styles.cardContainer}>
                <View style={{ width: "48%" }}>
                  <Stat label="Customers" value={dashboard.total_customers} />
                </View>

                <TouchableOpacity
                  style={{ width: "48%" }}
                  activeOpacity={0.8}
                  onPress={() =>{
                    router.push(`/staff-list?role=washer`);
                    //   {
                    //   pathname: "/staff-list",
                    //   params: { role: "washer" },
                    // })
                  }}
                >
                  <Stat label="Washers" value={dashboard.total_washers} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ width: "48%" }}
                  activeOpacity={0.8}
                  onPress={() =>{
                    router.push(`/staff-list?role=supervisor`);
                    //   {
                    //   pathname: "/staff-list",
                    //   params: { role: "supervisor" },
                    // })
                  }}
                >
                  <Stat label="Supervisors" value={dashboard.total_supervisors} />
                </TouchableOpacity>

                <View style={{ width: "48%" }}>
                  <Stat label="Total Jobs Today" value={dashboard.today_total_jobs} />
                </View>
                {/* <View style={{ width: "48%" }}>
                  <Stat label="Pending Wash" value={dashboard.today_pending_wash} />
                </View> */}
                <TouchableOpacity
                  style={{ width: "48%" }}
                  onPress={() =>
                    router.push({
                      pathname: "/wash-list",
                      params: { status: "PENDING" },
                    })
                  }
                >
                  <Stat label="Pending Wash" value={dashboard.today_pending_wash} />
                </TouchableOpacity>
                {/* <View style={{ width: "48%" }}>
                  <Stat label="Pending Approval" value={dashboard.today_pending_approval} />
                </View> */}
                <TouchableOpacity
                  style={{ width: "48%" }}
                  onPress={() =>
                    router.push({
                      pathname: "/wash-list",
                      params: { status: "PENDING_APPROVAL" },
                    })
                  }
                >
                  <Stat label="Pending Approval" value={dashboard.today_pending_approval} />
                </TouchableOpacity>
                {/* <View style={{ width: "48%" }}>
                  <Stat label="Approved Washed" value={dashboard.today_approved_washed} />
                </View> */}
                <TouchableOpacity
                  style={{ width: "48%" }}
                  onPress={() =>
                    router.push({
                      pathname: "/wash-list",
                      params: { status: "APPROVED_WASHED" },
                    })
                  }
                >
                  <Stat label="Approved Washed" value={dashboard.today_approved_washed} />
                </TouchableOpacity>
                {/* <View style={{ width: "48%" }}>
                  <Stat label="Approved Not Washed" value={dashboard.today_approved_not_washed} />
                </View> */}
                <TouchableOpacity
                  style={{ width: "48%" }}
                  onPress={() =>
                    router.push({
                      pathname: "/wash-list",
                      params: { status: "APPROVED_NOT_WASHED" },
                    })
                  }
                >
                  <Stat label="Approved Not Washed" value={dashboard.today_approved_not_washed} />
                </TouchableOpacity>
              </View>
            )}

            <PrimaryButton
              title="Create Washer / Supervisor"
              onPress={() => setModalVisible(true)}
            />

            <TextInput
              placeholder="Search Users"
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
              style={styles.search}
            />

            {users.map((item) => (
              <TouchableOpacity
                key={item.user_id}
                style={styles.userCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push(`/user-details?userId=${item.user_id}`)
                  //   {
                  //   pathname: "/user-details",
                  //   params: { userId: item.user_id },
                  // }
                // )
                }
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.userName}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Modal visible={modalVisible} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Create Staff</Text>

                  <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#666"
                    value={staffName}
                    onChangeText={setStaffName}
                    style={styles.input}
                  />

                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#666"
                    value={staffEmail}
                    onChangeText={setStaffEmail}
                    style={styles.input}
                  />

                  <TextInput
                    placeholder="Phone"
                    placeholderTextColor="#666"
                    value={staffPhone}
                    onChangeText={setStaffPhone}
                    style={styles.input}
                  />

                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#666"
                    secureTextEntry
                    value={staffPassword}
                    onChangeText={setStaffPassword}
                    style={styles.input}
                  />

                  <View style={styles.roleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.roleBtn,
                        staffRole === "washer" && styles.roleSelected,
                      ]}
                      onPress={() => setStaffRole("washer")}
                    >
                      <Text>Washer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.roleBtn,
                        staffRole === "supervisor" && styles.roleSelected,
                      ]}
                      onPress={() => setStaffRole("supervisor")}
                    >
                      <Text>Supervisor</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.modalCreateBtn}
                    onPress={createStaff}
                    disabled={creating}
                  >
                    <Text style={{ color: "#fff" }}>
                      {creating ? "Creating..." : "Create"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={{ marginTop: 10, color: "red" }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    // <Card style={{ width: "48%" }}>
    <Card>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  subHeading: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#ef4444",
    borderRadius: 12,
  },

  logoutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },

  search: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },

  userCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 2,
  },

  userName: {
    fontWeight: "600",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "90%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 6,
  },

  roleSelected: {
    backgroundColor: "#007bff",
  },

  modalCreateBtn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});

