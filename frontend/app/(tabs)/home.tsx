// import { View, StyleSheet, Alert } from "react-native";
// import { Text, Button } from "react-native-paper";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function HomeScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(true);

//   const API = "http://192.168.31.140:5000";

//   // Fetch user details using token (optional but nice)
//   useEffect(() => {
//     if (!params.token) {
//       console.log("❌ No token found → Redirecting to login");
//       setTimeout(() => {
//         router.replace("/");
//       }, 0);
//       return;
//     }
//     const fetchUser = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.post(`${API}/auth/me`, {
//           token: params.token,
//         });
//         setName(res.data.name);
//       } catch (err) {
//         console.log("Error fetching profile:", err);
//         Alert.alert("Session expired", "Please login again.");
//         router.replace('/')
//       }finally{
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [params.token]);

//   if(loading){
//     return(
//       <View style ={styles.container}>
//         <Text>Loading your profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text variant="headlineMedium" style={styles.title}>
//         Welcome {name || "User"} 👋
//       </Text>

//       <Button
//         mode="contained"
//         style={styles.btn}
//         onPress={() =>
//           router.push({
//             pathname: "/(tabs)/add-car",
//             params: { token: params.token },
//           })
//         }
//       >
//         + Add Car
//       </Button>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     marginBottom: 20,
//   },
//   btn: {
//     backgroundColor: "#007bff",
//     paddingHorizontal: 20,
//   },
// });

// import { useEffect, useState } from "react";
// import { View, FlatList, StyleSheet, Image } from "react-native";
// import { Text, Card, ActivityIndicator, Button } from "react-native-paper";
// import axios from "axios";
// import { useLocalSearchParams, useRouter } from "expo-router";

// export default function HomeScreen() {
//   const { token } = useLocalSearchParams();
//   const router = useRouter();

//   const [cars, setCars] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchCars = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.post(
//         "http://192.168.31.140:5000/auth/my-cars",
//         { token }
//       );
//       setCars(res.data.cars);
//     } catch (err: any) {
//       console.log("Fetch error:", err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCars();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text variant="headlineMedium" style={styles.title}>
//         Your Cars
//       </Text>

//       <Button
//         mode="contained"
//         onPress={() => router.push({ pathname: "/(tabs)/add-car", params: { token } })}
//         style={styles.addBtn}
//       >
//         + Add Car
//       </Button>

//       {loading ? (
//         <ActivityIndicator size="large" style={{ marginTop: 40 }} />
//       ) : cars.length === 0 ? (
//         <Text>No cars added yet.</Text>
//       ) : (
//         <FlatList
//           data={cars}
//           keyExtractor={(item) => item.car_id.toString()}
//           renderItem={({ item }) => (
//             <Card style={styles.card}>
//               <Card.Content>
//                 <Text style={styles.name}>{item.make} {item.model}</Text>
//                 <Text>Color: {item.color}</Text>
//                 <Text>Reg No: {item.registration_number}</Text>
//                 <Text>Pincode: {item.pincode}</Text>
//                 <Text>Area: {item.area}</Text>

//                 {item.car_photo ? (
//                   <Image
//                     source={{ uri: `data:image/jpeg;base64,${item.car_photo}` }}
//                     style={{ width: "100%", height: 150, marginTop: 10, borderRadius: 8 }}
//                   />
//                 ) : null}
//               </Card.Content>
//             </Card>
//           )}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "white" },
//   title: { marginBottom: 10, fontWeight: "bold" },
//   addBtn: { marginBottom: 15 },
//   card: { marginBottom: 15 },
//   name: { fontWeight: "bold", fontSize: 18, marginBottom: 5 }
// });

// import { useEffect, useState } from "react";
// import { View, ScrollView, StyleSheet, Image } from "react-native";
// import { Text } from "react-native-paper";
// import axios from "axios";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";

// export default function HomeScreen() {
//   const [user, setUser] = useState<any>(null);
//   const [cars, setCars] = useState<any[]>([]);
//   const { token: navToken } = useLocalSearchParams();
//   const [token, setToken] = useState(navToken || "");
//   const router = useRouter();

//   const loadToken = async () => {
//   const savedToken = await SecureStore.getItemAsync("token");
//   if (savedToken) {
//     setToken(savedToken);
//   } else {
//     router.replace("/");
//   }
// };

// useEffect(() => {
//   loadToken();
// }, []);

//   const fetchUser = async () => {
//     const res = await axios.post("http://192.168.31.140:5000/auth/me", { token });
//     setUser(res.data);
//   };

//   const fetchCars = async () => {
//     const res = await axios.post("http://192.168.31.140:5000/auth/my-cars", { token });
//     setCars(res.data.cars);
//   };

//   useEffect(() => {
//     fetchUser();
//     fetchCars();
//   }, []);

//   return (
//     <ScrollView style={styles.container}>
//       {user && (
//         <Text style={styles.title}>Welcome {user.name}</Text>
//       )}

//       <Text style={styles.section}>Your Cars</Text>

//       {cars.length === 0 ? (
//         <Text style={styles.noCars}>No cars added yet.</Text>
//       ) : (
//         cars.map((car) => (
//           <View key={car.car_id} style={styles.card}>
//             <Text style={styles.carText}>{car.make} {car.model}</Text>
//             <Text>Color: {car.color}</Text>
//             <Text>Reg No: {car.registration_number}</Text>
//             <Text>Area: {car.area}</Text>
//             <Text>Pincode: {car.pincode}</Text>

//             {car.car_photo ? (
//               <Image
//                 source={{ uri: `data:image/jpeg;base64,${car.car_photo}` }}
//                 style={styles.photo}
//               />
//             ) : null}
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "white" },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
//   section: { fontSize: 20, marginBottom: 10, fontWeight: "600" },
//   noCars: { fontSize: 16, color: "gray", marginTop: 10 },
//   card: {
//     backgroundColor: "#f4f4f4",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   carText: { fontSize: 18, fontWeight: "bold" },
//   photo: { width: "100%", height: 200, marginTop: 10, borderRadius: 10 },
// });

// import { useEffect, useState } from "react";
// import { View, ScrollView, StyleSheet, Image } from "react-native";
// import { Text } from "react-native-paper";
// import axios from "axios";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";

// export default function HomeScreen() {
//   const router = useRouter();
//   const { token: navToken } = useLocalSearchParams();
//   const normalize = (v: any) => Array.isArray(v) ? v[0] : v;
//   const [token, setToken] = useState<string | null>(normalize(navToken) || null);
//   const [user, setUser] = useState<any>(null);
//   const [cars, setCars] = useState<any[]>([]);
//   const [isReady, setIsReady] = useState(false);

//   // Load token from nav params OR secure store
//   const loadToken = async () => {
//     let t = normalize(navToken);
//     if (t) {
//       await SecureStore.setItemAsync("token", t);
//       // const normalized = Array.isArray(navToken) ? navToken[0] : navToken;
//       setToken(t);
//       // await SecureStore.setItemAsync("token", normalized);
//       setIsReady(true);
//       return;
//     }
//     t = await SecureStore.getItemAsync("token");

//     // const savedToken = await SecureStore.getItemAsync("token");
//     if (t) {
//       setToken(t);
//       setIsReady(true);
//     } else {
//       router.replace("/");
//     }
//   };

//   useEffect(() => {
//     loadToken();
//   }, []);

//   const fetchUser = async (jwtToken: string) => {
//     const res = await axios.post("http://192.168.31.140:5000/auth/me", { token: jwtToken });
//     setUser(res.data);
//   };

//   const fetchCars = async (jwtToken: string) => {
//     const res = await axios.post("http://192.168.31.140:5000/auth/my-cars", { token: jwtToken });
//     setCars(res.data.cars);
//   };

//   // Fetch user + car data when token is ready
//   useEffect(() => {
//     if (!isReady || !token) return;

//     fetchUser(token).catch(console.log);
//     fetchCars(token).catch(console.log);
//   }, [isReady, token]);

//   return (
//     <ScrollView style={styles.container}>
//       {user && <Text style={styles.title}>Welcome {user.name}</Text>}

//       <Text style={styles.section}>Your Cars</Text>

//       {cars.length === 0 ? (
//         <Text style={styles.noCars}>No cars added yet.</Text>
//       ) : (
//         cars.map((car) => (
//           <View key={car.car_id} style={styles.card}>
//             <Text style={styles.carText}>{car.make} {car.model}</Text>
//             <Text>Color: {car.color}</Text>
//             <Text>Reg No: {car.registration_number}</Text>
//             <Text>Area: {car.area}</Text>
//             <Text>Pincode: {car.pincode}</Text>

//             {car.car_photo ? (
//               <Image
//                 source={{ uri: `data:image/jpeg;base64,${car.car_photo}` }}
//                 style={styles.photo}
//               />
//             ) : null}
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "white" },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
//   section: { fontSize: 20, marginBottom: 10, fontWeight: "600" },
//   noCars: { fontSize: 16, color: "gray", marginTop: 10 },
//   card: {
//     backgroundColor: "#f4f4f4",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   carText: { fontSize: 18, fontWeight: "bold" },
//   photo: { width: "100%", height: 200, marginTop: 10, borderRadius: 10 },
// });

// import { useEffect, useState, useCallback } from "react";
// import { View, ScrollView, StyleSheet, Image } from "react-native";
// import { Text } from "react-native-paper";
// import axios from "axios";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import { useFocusEffect } from "@react-navigation/native";

// export default function HomeScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   // Normalize param (because expo sometimes passes ["token"])
//   const normalize = (v: string | any[]) => (Array.isArray(v) ? v[0] : v);
//   const navToken = normalize(params.token);

//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUser] = useState<any>(null);
//   const [cars, setCars] = useState<any[]>([]);
//   const [isReady, setIsReady] = useState(false);

//   // Load token from navigation or secure store
//   const loadToken = async () => {
//     let t = navToken;

//     if (t) {
//       // Save the new login token
//       await SecureStore.setItemAsync("token", t);
//       setToken(t);
//       setIsReady(true);
//       return;
//     }

//     // No nav token → fallback to stored token
//     t = await SecureStore.getItemAsync("token");

//     if (t) {
//       setToken(t);
//       setIsReady(true);
//     } else {
//       router.replace("/"); // redirect to login
//     }
//   };

//   // Important: Run whenever navToken changes
//   useEffect(() => {
//     loadToken();
//   }, [navToken]);

//   const fetchUser = async (jwtToken: string) => {
//     const res = await axios.post("http://192.168.31.140:5000/auth/me", {
//       token: jwtToken,
//     });
//     setUser(res.data);
//   };

//   const fetchCars = async (jwtToken: string) => {
//     const res = await axios.post(
//       "http://192.168.31.140:5000/auth/my-cars",
//       { token: jwtToken }
//     );
//     setCars(res.data.cars);
//   };

//   // Fetch data when token is ready
//   useEffect(() => {
//     if (!isReady || !token) return;

//     // Reset old data so it doesn’t flash previous user's info
//     setUser(null);
//     setCars([]);

//     fetchUser(token).catch(console.log);
//     fetchCars(token).catch(console.log);
//   }, [isReady, token]);

//   useFocusEffect(
//     useCallback(() => {
//       if (token) {
//         fetchUser(token);
//         fetchCars(token);
//       }
//     }, [token]));

//   // PREVENT SCREEN FROM LOADING BEFORE TOKEN READY
//   if (!isReady || !token) {
//     return <Text style={{ marginTop: 200, textAlign: "center" }}>Loading...</Text>;
//   }
//   return (
//   <ScrollView style={styles.container}>

//     {user && <Text style={styles.title}>Welcome {user.name}</Text>}

//     <Text style={styles.section}>Your Cars</Text>

//     {cars.length === 0 ? (
//       <>
//         <Text style={styles.noCars}>No cars added yet.</Text>

//         <View style={{ marginTop: 20 }}>
//           <Text
//             style={styles.addCarButton}
//             onPress={() => router.push("/add-car")}
//           >
//             + Add a Car
//           </Text>
//         </View>
//       </>
//     ) : (
//       <>
//         {cars.map((car) => (
//           <View key={car.car_id} style={styles.card}>
//             <Text style={styles.carText}>
//               {car.make} {car.model}
//             </Text>
//             <Text>Color: {car.color}</Text>
//             <Text>Reg No: {car.registration_number}</Text>
//             <Text>Area: {car.area}</Text>
//             <Text>Pincode: {car.pincode}</Text>

//             {car.car_photo ? (
//               <Image
//                 source={{ uri: `data:image/jpeg;base64,${car.car_photo}` }}
//                 style={styles.photo}
//               />
//             ) : null}
//           </View>
//         ))}

//         {/* Add Car button ALWAYS visible */}
//         <View style={{ marginTop: 20, marginBottom: 30 }}>
//           <Text
//             style={styles.addCarButton}
//             onPress={() => router.push("/add-car")}
//           >
//             + Add a Car
//           </Text>
//         </View>
//       </>
//     )}
//   </ScrollView>
// );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "lightgrey" },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
//   addCarButton: {
//   backgroundColor: "#007bff",
//   color: "white",
//   paddingVertical: 12,
//   textAlign: "center",
//   borderRadius: 10,
//   fontSize: 18,
//   fontWeight: "bold",
//   overflow: "hidden",
// },

//   section: { fontSize: 20, marginBottom: 10, fontWeight: "600" },
//   noCars: { fontSize: 16, color: "gray", marginTop: 10 },
//   card: {
//     backgroundColor: "#f4f4f4",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   carText: { fontSize: 18, fontWeight: "bold" },
//   photo: { width: "100%", height: 200, marginTop: 10, borderRadius: 10 },
// });

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     marginBottom: 20,
//   },
//   btn: {
//     backgroundColor: "#007bff",
//     paddingHorizontal: 20,
//   },
// });

import { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const normalize = (v: string | any[]) => (Array.isArray(v) ? v[0] : v);
  const navToken = normalize(params.token);

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  const loadToken = async () => {
    let t = navToken;

    if (t) {
      await SecureStore.setItemAsync("token", t);
      setToken(t);
      setIsReady(true);
      return;
    }

    t = await SecureStore.getItemAsync("token");

    if (t) {
      setToken(t);
      setIsReady(true);
    } else {
      router.replace("/");
    }
  };

  useEffect(() => {
    loadToken();
  }, [navToken]);

  const fetchUser = async (jwtToken: string) => {
    const res = await axios.post("http://192.168.31.140:5000/auth/me", {
      token: jwtToken,
    });
    setUser(res.data);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    router.replace("/");
  };

  const fetchCars = async (jwtToken: string) => {
    const res = await axios.post("http://192.168.31.140:5000/auth/my-cars", {
      token: jwtToken,
    });
    setCars(res.data.cars);
  };

  useEffect(() => {
    if (!isReady || !token) return;
    setUser(null);
    setCars([]);

    fetchUser(token).catch(console.log);
    fetchCars(token).catch(console.log);
  }, [isReady, token]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchUser(token);
        fetchCars(token);
      }
    }, [token])
  );

  if (!isReady || !token) {
    return (
      <Text style={{ marginTop: 200, textAlign: "center" }}>Loading...</Text>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.welcome}>Hello,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>

        {/* Logout button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>Your Cars</Text>

      {cars.length === 0 ? (
        <>
          <Text style={styles.noCars}>You haven't added any cars yet.</Text>

          <TouchableOpacity
            onPress={() => router.push("/add-car")}
            style={styles.addCarButton}
          >
            <Text style={styles.addCarButtonText}>+ Add a Car</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {cars.map((car) => (
            <View key={car.car_id} style={styles.card}>
              <Text style={styles.carTitle}>
                {car.make} {car.model}
              </Text>
              <Text style={styles.carDetail}>Color: {car.color}</Text>
              <Text style={styles.carDetail}>
                Reg No: {car.registration_number}
              </Text>
              <Text style={styles.carDetail}>Area: {car.area}</Text>
              <Text style={styles.carDetail}>Pincode: {car.pincode}</Text>

              {car.car_photo ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${car.car_photo}` }}
                  style={styles.carPhoto}
                />
              ) : null}
            </View>
          ))}

          <TouchableOpacity
            onPress={() => router.push("/add-car")}
            style={styles.addCarButton}
          >
            <Text style={styles.addCarButtonText}>+ Add Another Car</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "lightgrey",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  avatarText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },

  welcome: {
    fontSize: 16,
    color: "#666",
  },

  userName: {
    fontSize: 22,
    fontWeight: "bold",
  },

  section: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  noCars: {
    color: "#555",
    marginVertical: 20,
    fontSize: 16,
  },

  addCarButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  addCarButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },

  carTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  carDetail: {
    fontSize: 15,
    marginBottom: 2,
    color: "#444",
  },

  carPhoto: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 10,
  },
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
});
