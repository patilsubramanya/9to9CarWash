// import ScreenContainer from "@/components/ui/ScreenContainer";
// import Card from "@/components/ui/Card";
// import PrimaryButton from "@/components/ui/PrimaryButton";
// import { useLocalSearchParams } from "expo-router";
// import { useEffect, useState } from "react";
// import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";
// import axios from "axios";
// import * as SecureStore from "expo-secure-store";

// export default function StaffList() {

//   const { role } = useLocalSearchParams();
//   const [staff, setStaff] = useState<any[]>([]);

//   const loadStaff = async () => {
//     try {
//       const token = await SecureStore.getItemAsync("token");

//       const res = await axios.get(
//         `http://192.168.31.81:5000/admin/staff?role=${role}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setStaff(res.data.staff);

//     } catch (err) {
//       console.log("Load staff error");
//     }
//   };

//   useEffect(() => {
//     loadStaff();
//   }, []);

//   const toggleStatus = async (user: any) => {

//     const actionText = user.is_active ? "Suspend" : "Activate";

//     Alert.alert(
//       `${actionText} ${role}`,
//       `Are you sure you want to ${actionText.toLowerCase()} ${user.name}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: actionText,
//           onPress: async () => {
//             try {

//               const token = await SecureStore.getItemAsync("token");

//               await axios.put(
//                 `http://192.168.31.81:5000/admin/users/${user.user_id}/status`,
//                 { is_active: user.is_active ? 0 : 1 },
//                 { headers: { Authorization: `Bearer ${token}` } }
//               );

//               loadStaff();

//             } catch (err) {
//               Alert.alert("Error", "Failed to update status");
//             }
//           }
//         }
//       ]
//     );
//   };

//   return (
//     <ScreenContainer>

//       <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 20 }}>
//         {role === "washer" ? "Washers" : "Supervisors"}
//       </Text>

//       <ScrollView>

//         <View style={Styles.cardContainer}>
//                   {staff.map((s) => (
//                       <Card key={s.user_id} style={{ marginBottom: 12 }}>

//                           <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>

//                               <View style={{ flex: 1 }}>
//                                   <Text style={{ fontSize: 18, fontWeight: "600" }}>
//                                       {s.name}
//                                   </Text>

//                                   <Text style={{ color: "#6B7280", marginTop: 2 }}>
//                                       {s.email}
//                                   </Text>

//                                   <Text style={{ color: "#6B7280" }}>
//                                       {s.phone}
//                                   </Text>
//                               </View>

//                               <View
//                                   style={{
//                                       backgroundColor: s.is_active ? "#16A34A" : "#DC2626",
//                                       paddingHorizontal: 10,
//                                       paddingVertical: 4,
//                                       borderRadius: 20
//                                   }}
//                               >
//                                   <Text style={{ color: "white", fontSize: 12 }}>
//                                       {s.is_active ? "Active" : "Suspended"}
//                                   </Text>
//                               </View>

//                           </View>

//                           <View style={{ marginTop: 12 }}>
//                               <PrimaryButton
//                                   title={s.is_active ? "Suspend" : "Activate"}
//                                   onPress={() => toggleStatus(s)}
//                               />
//                           </View>

//                       </Card>

//                       //   <Card key={s.user_id} style={{ marginBottom: 16 }}>

//                       //     <Text style={{ fontSize: 18, fontWeight: "600" }}>
//                       //       {s.name}
//                       //     </Text>

//                       //     <Text>{s.email}</Text>
//                       //     <Text>{s.phone}</Text>

//                       //     <Text style={{
//                       //       marginTop: 6,
//                       //       color: s.is_active ? "green" : "red"
//                       //     }}>
//                       //       {s.is_active ? "Active" : "Suspended"}
//                       //     </Text>

//                       //     <PrimaryButton
//                       //       title={s.is_active ? "Suspend" : "Activate"}
//                       //       onPress={() => toggleStatus(s)}
//                       //     />

//                       //   </Card>

//                   ))}
//         </View>

//       </ScrollView>

//     </ScreenContainer>
//   );
// }

// const styles = StyleSheet.create({
//   cardContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },

//   staffCard: {
//     width: "48%",
//     marginBottom: 12,
//   },

//   name: {
//     fontSize: 16,
//     fontWeight: "600",
//   },

//   meta: {
//     color: "#6B7280",
//     marginTop: 2,
//   },

//   statusActive: {
//     marginTop: 8,
//     color: "#16A34A",
//     fontWeight: "600",
//   },

//   statusSuspended: {
//     marginTop: 8,
//     color: "#DC2626",
//     fontWeight: "600",
//   }
// });



import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function StaffList() {

  const { role } = useLocalSearchParams();
  const [staff, setStaff] = useState<any[]>([]);

  const loadStaff = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const res = await axios.get(
        `http://192.168.31.81:5000/admin/staff?role=${role}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStaff(res.data.staff);

    } catch (err) {
      console.log("Load staff error");
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const toggleStatus = async (user: any) => {

    const actionText = user.is_active ? "Suspend" : "Activate";

    Alert.alert(
      `${actionText} ${role}`,
      `Are you sure you want to ${actionText.toLowerCase()} ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionText,
          onPress: async () => {
            try {

              const token = await SecureStore.getItemAsync("token");

              await axios.put(
                `http://192.168.31.81:5000/admin/users/${user.user_id}/status`,
                { is_active: user.is_active ? 0 : 1 },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              loadStaff();

            } catch (err) {
              Alert.alert("Error", "Failed to update status");
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer>

      <Text style={styles.title}>
        {role === "washer" ? "Washers" : "Supervisors"}
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        <View style={styles.cardContainer}>
          {staff.map((s) => (
            <Card key={s.user_id} style={styles.staffCard}>

              <View style={styles.headerRow}>

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.name}</Text>

                  <Text style={styles.meta}>{s.email}</Text>
                  <Text style={styles.meta}>{s.phone}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: s.is_active ? "#16A34A" : "#DC2626" }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {s.is_active ? "Active" : "Suspended"}
                  </Text>
                </View>

              </View>

              <View style={{ marginTop: 12 }}>
                <PrimaryButton
                  title={s.is_active ? "Suspend" : "Activate"}
                  onPress={() => toggleStatus(s)}
                />
              </View>

            </Card>
          ))}
        </View>

      </ScrollView>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  staffCard: {
    width: "48%",
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  meta: {
    color: "#6B7280",
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },

  statusText: {
    color: "white",
    fontSize: 12
  }

});
