import { Calendar } from "react-native-calendars";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../api"
import * as SecureStore from "expo-secure-store";

export default function ChooseService() {
  const router = useRouter();
  const { carId } = useLocalSearchParams();

  const [cars, setCars] = useState<any[]>([]);
  const [carMappings, setCarMappings] = useState<Record<string, { wash_pattern: string; alternate_group?: string }>>({});
  const [allowedPlans, setAllowedPlans] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    init();
  }, []));


  const init = async () => {
    const token = await SecureStore.getItemAsync("token");

    const carRes = await api.post("/auth/my-cars", {});

    const carsList = carRes.data.cars;
    console.log("CARS FROM API:", carsList);
    console.log("CAR COUNT:", carsList.length);
    setCars(carsList);

    // initialize car mappings with a sensible default (regular)
    const defaults: Record<string, { wash_pattern: string; alternate_group?: string }> = {};
    carsList.forEach((c: any, idx: number) => {
      defaults[c.car_id] = { wash_pattern: "daily" };
    });
    setCarMappings(defaults);

    const count = carsList.length;

    if (count === 1) setAllowedPlans(["daily"]);
    if (count === 2) setAllowedPlans(["daily", "alternate"]);
    if (count >= 3)
      setAllowedPlans(["daily", "alternate", "occasional"]);

    setLoading(false);
  };

  const isSunday = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
    };

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  // Update carMappings when selectedPlan changes
  useEffect(() => {
    if (!selectedPlan || cars.length === 0) return;
    const newMap: Record<string, { wash_pattern: string; alternate_group?: string }> = {};
    cars.forEach((c: any, idx: number) => {
      if (selectedPlan === "daily") {
        newMap[c.car_id] = { wash_pattern: "daily" };
      } else if (selectedPlan === "alternate") {
        newMap[c.car_id] = { wash_pattern: "alternate", alternate_group: idx % 2 === 0 ? "A" : "B" };
      } else if (selectedPlan === "occasional") {
        // First 2 cars: alternate, 3rd+ cars: daily (user can change to weekly)
        if (idx < 2) {
          newMap[c.car_id] = { wash_pattern: "alternate", alternate_group: idx % 2 === 0 ? "A" : "B" };
        } else {
          newMap[c.car_id] = { wash_pattern: "daily" };
        }
      }
    });
    setCarMappings(newMap);
  }, [selectedPlan, cars]);

  const updateMapping = (carId: any, pattern: string) => {
    setCarMappings((prev) => ({ ...prev, [carId]: { ...(prev[carId] || {}), wash_pattern: pattern, alternate_group: prev[carId]?.alternate_group } }));
  };

  const updateGroup = (carId: any, group: string) => {
    setCarMappings((prev) => ({ ...prev, [carId]: { ...(prev[carId] || {}), alternate_group: group } }));
  };

  const confirmSubscription = async () => {
    if (!selectedPlan || !startDate) return;

    try {
      const token = await SecureStore.getItemAsync("token");

      // Build car_mappings payload from UI selections
      const car_mappings = Object.keys(carMappings).map((key) => ({
        car_id: key,
        wash_pattern: carMappings[key].wash_pattern,
        alternate_group: carMappings[key].alternate_group,
      }));

      await api.post("/subscription/create-or-update", {
        subscription_type: selectedPlan,
        start_date: startDate,
        car_mappings,
      });

      router.replace("/home");
    } catch (err: any) {
      console.error("Subscription error:", err);
    }
  };

  // Preview will be rendered based on selected start date and per-car mappings


  if (loading) {
    return <Text style={{ marginTop: 200, textAlign: "center" }}>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Select Subscription</Text>
      
      <Text style={styles.subHeading}>Choose Wash Plan</Text>
      <View style={{ marginBottom: 16 }}>
        {allowedPlans.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setSelectedPlan(p)}
            style={[styles.planCard, selectedPlan === p && styles.selectedPlan]}
          >
            <Text style={styles.planText}>
              {p === "daily"
                ? "Daily (Every day)"
                : p === "alternate"
                ? "Alternate (Every other day)"
                : "Occasional (Mixed)"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subHeading}>Select Start Date</Text>

    <Calendar
      minDate={getMinDate()}
      onDayPress={(day) => {
        if (isSunday(day.dateString)) return;
        setStartDate(day.dateString);
      }}
      markedDates={
        startDate
          ? {
              [startDate]: {
                selected: true,
                selectedColor: "#28a745",
              },
            }
          : {}
      }
      theme={{
        todayTextColor: "#007bff",
        arrowColor: "#007bff",
      }}
      dayComponent={({ date, state }) => {
        if (!date) return null;
        const sunday = isSunday(date.dateString);

        return (
          <TouchableOpacity
            disabled={state === "disabled" || sunday}
            onPress={() => setStartDate(date.dateString)}
            style={{ opacity: sunday ? 0.3 : 1 }}
          >
            <Text
              style={{
                textAlign: "center",
                color: sunday ? "red" : state === "disabled" ? "#ccc" : "#000",
              }}
            >
              {date.day}
            </Text>
          </TouchableOpacity>
        );
      }}
    />

    {selectedPlan && startDate && (
      <View style={styles.previewBox}>
        <Text style={styles.previewTitle}>Subscription Preview</Text>
        <Text style={styles.previewNote}>
          Existing subscriptions (if any) will end today. New subscription
          starts from {startDate}.
        </Text>
        {cars.map((car, idx) => (
          <Text key={car.car_id} style={{ marginTop: 6, fontSize: 14 }}>
            {car.make} {car.model}: {carMappings[car.car_id]?.wash_pattern}{carMappings[car.car_id]?.alternate_group ? ` (Group ${carMappings[car.car_id].alternate_group})` : ''}
          </Text>
        ))}
      </View>
    )}
    {/* Per-car group selection for Alternate plans */}
    {selectedPlan && cars.length > 0 && (
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
          {selectedPlan === "occasional" ? "Customize" : "Adjust Groups (optional)"}
        </Text>
        {cars.map((car, idx) => {
          const mapping = carMappings[car.car_id];
          const isAlternate = mapping?.wash_pattern === "alternate";
          const isThirdCarOccasional = selectedPlan === "occasional" && idx >= 2;
          
          // For Alternate plan: show group selection only
          if (selectedPlan === "alternate" && isAlternate) {
            return (
              <View key={car.car_id} style={{ marginBottom: 12, padding: 10, backgroundColor: '#fff', borderRadius: 8 }}>
                <Text style={{ fontWeight: '600' }}>{car.make} {car.model} ({car.registration_number})</Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 4, marginBottom: 8 }}>Select alternation group</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => updateGroup(car.car_id, 'A')} style={[styles.groupBtn, carMappings[car.car_id]?.alternate_group === 'A' && styles.selectedGroup]}>
                    <Text>Group A</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateGroup(car.car_id, 'B')} style={[styles.groupBtn, carMappings[car.car_id]?.alternate_group === 'B' && styles.selectedGroup]}>
                    <Text>Group B</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          // For Occasional plan
          if (selectedPlan === "occasional") {
            // First 2 cars: alternate with group selection
            if (idx < 2 && isAlternate) {
              return (
                <View key={car.car_id} style={{ marginBottom: 12, padding: 10, backgroundColor: '#fff', borderRadius: 8 }}>
                  <Text style={{ fontWeight: '600' }}>{car.make} {car.model} ({car.registration_number})</Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4, marginBottom: 8 }}>Alternate - Select group</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => updateGroup(car.car_id, 'A')} style={[styles.groupBtn, carMappings[car.car_id]?.alternate_group === 'A' && styles.selectedGroup]}>
                      <Text>Group A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => updateGroup(car.car_id, 'B')} style={[styles.groupBtn, carMappings[car.car_id]?.alternate_group === 'B' && styles.selectedGroup]}>
                      <Text>Group B</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            // 3rd car: daily or weekly selection
            if (idx >= 2) {
              return (
                <View key={car.car_id} style={{ marginBottom: 12, padding: 10, backgroundColor: '#fff', borderRadius: 8 }}>
                  <Text style={{ fontWeight: '600' }}>{car.make} {car.model} ({car.registration_number})</Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4, marginBottom: 8 }}>Choose wash pattern</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => updateMapping(car.car_id, 'daily')} style={[styles.optionBtn, carMappings[car.car_id]?.wash_pattern === 'daily' && styles.selectedOption]}>
                      <Text>Daily</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => updateMapping(car.car_id, 'weekly')} style={[styles.optionBtn, carMappings[car.car_id]?.wash_pattern === 'weekly' && styles.selectedOption]}>
                      <Text>Weekly</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }
          }

          return null;
        })}
      </View>
    )}
      <TouchableOpacity
        disabled={!selectedPlan || !startDate}
        style={[
          styles.confirmBtn,
          (!selectedPlan || !startDate) && { opacity: 0.5 },
        ]}
        onPress={confirmSubscription}
      >
        <Text style={styles.confirmText}>Confirm Subscription</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  planCard: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedPlan: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  planText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  dateBtn: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateText: {
    fontSize: 18,
    textAlign:"center"
},
subHeading: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 20,
  marginBottom: 10,
},
previewBox: {
  backgroundColor: "#f8f9fa",
  padding: 15,
  borderRadius: 10,
  marginTop: 20,
},
previewTitle: {
  fontSize: 16,
  fontWeight: "700",
  marginBottom: 6,
},
previewText: {
  fontSize: 14,
  color: "#333",
},
previewNote: {
  fontSize: 12,
  color: "#666",
  marginTop: 8,
},
confirmBtn:{
backgroundColor:"#4CAF50",
paddingVertical :15,
borderRadius :10
},
confirmText:{
color:"#fff",
fontSize :18
}
 ,
 optionBtn: {
   paddingHorizontal: 12,
   paddingVertical: 8,
   backgroundColor: '#f1f1f1',
   borderRadius: 6,
   borderWidth: 1,
   borderColor: '#ddd'
 },
 selectedOption: {
   backgroundColor: '#e3f2fd',
   borderColor: '#2196f3'
 },
 groupBtn: {
   paddingHorizontal: 10,
   paddingVertical: 6,
   backgroundColor: '#f1f1f1',
   borderRadius: 6,
   borderWidth: 1,
   borderColor: '#ddd'
 },
 selectedGroup: {
   backgroundColor: '#d1ffd6',
   borderColor: '#28a745'
 },
 disabledBtn: {
   backgroundColor: '#e0e0e0',
   borderColor: '#bbb',
   opacity: 0.5
 },
 disabledText: {
   color: '#999'
 }
});
