import { useEffect, useState } from "react";
import { Modal, Image, TouchableOpacity, View, StyleSheet, Alert } from "react-native";
import { Text } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


export default function ViewSubscription() {
  type CalendarMark = {
    customStyles?: {
      container?: any;
      text?: any;
    };
    type?: "scheduled" | "washed" | "not_washed";
    reasonData?: any;
  };
  const reasonLabels: Record<string, string> = {
  CUSTOMER_DENIED: "Customer denied",
  CAR_NOT_AVAILABLE: "Car not available",
  GATE_LOCKED: "Gate locked",
  NO_WATER: "No water",
  BAD_WEATHER: "Bad weather",
  OTHER: "Other",
};
  const { carId } = useLocalSearchParams();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [dateMeta, setDateMeta] = useState<Record<string, any>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<any>(null);
  const [subInfo, setSubInfo] = useState<any>(null);
  const [checkedSubscription, setCheckedSubscription] = useState(false);
  const router = useRouter();

  useFocusEffect(
  useCallback(() => {
    const month = new Date().toISOString().slice(0, 7);
    setSelectedMonth(month);
    loadCalendar(month);
  }, [carId])
);

  const loadCalendar = async (month: string) => {
    setMarkedDates({});
    const token = await SecureStore.getItemAsync("token");

    const res = await axios.post(
      "http://192.168.31.81:5000/subscription/car-calendar",
      {
        car_id: carId,
        month,
      },
      {
        headers: {
            Authorization: `Bearer ${token}`,
      },
    }
    );
    if (!res.data || !res.data.subscription_type) {
      Alert.alert(
        "No subscription",
        "No subscription found for this car.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/home"),
          }
        ]
      );
      return;
    }
    setSubInfo({
      type: res.data.subscription_type,
      pattern: res.data.wash_pattern,
      group: res.data.alternate_group,
      start: res.data.start_date,
    });
    setCheckedSubscription(true);
    
    const { scheduled = [], washed = [], not_washed = [], details = {} } = res.data;

    
    console.log("VIEW SUB API RESPONSE 👉", res.data);
    console.log("CAR ID VIEW:", carId);
    console.log("SCHEDULED DATES COUNT:", (res.data.scheduled_dates || []).length);

    // const marks: Record<string, { selected: boolean; selectedColor: string }> = {};
    // (res.data.scheduled_dates || []).forEach((d: string) => {
    //   marks[d] = {
    //     selected: true,
    //     selectedColor: "#28a745",
    //   };
    // });
    const marks: any = {};
    const meta: Record<string, any> = {};

    // 1️⃣ Scheduled → circle
    scheduled.forEach((d: string) => {
      marks[d] = {
        customStyles: {
          container: {
            borderWidth: 1.5,
            borderColor: "#007bff",
            borderRadius: 16,
          },
          text: {
            color: "#007bff",
          },
        },
        // type: "scheduled",
      };
      meta[d] = {status: "scheduled"}; 
    });

    // 2️⃣ Washed → green (override scheduled)
    washed.forEach((d: string) => {
      marks[d] = {
        customStyles: {
          container: {
            backgroundColor: "#28a745",
            borderRadius: 16,
          },
          text: { color: "white", fontWeight: "bold" },
        },
        // type: "washed",
      };
      meta[d] = {status: "washed"}; 
    });
    
    // 3️⃣ Not washed → red (override scheduled)
    not_washed.forEach((d: string) => {
      marks[d] = {
        customStyles: {
          container: {
            backgroundColor: "#dc3545",
            borderRadius: 16,
          },
          text: { color: "white", fontWeight: "bold" },
        },
        // type: "not_washed",
        // reasonData: details[d],
      };
      meta[d] = {status: "not_washed", 
        reason: details[d]?.reason,
        image: details[d]?.image,
      }; 
    });

    setMarkedDates(marks);
    setDateMeta(meta);
  };

  const handleMonthChange = (date: any) => {
    const monthString = date.dateString.slice(0, 7);
    console.log("Month changed to:", monthString);
    setSelectedMonth(monthString);
    loadCalendar(monthString);
  };

  const handleDayPress = (day: any) => {
  const info = dateMeta[day.dateString];
  if (!info) return;

  if (info.status === "washed") {
    alert("Car was washed on this day");
    return;
  }

  if (info.status === "not_washed") {
    setSelectedInfo(info);
    setModalVisible(true);
  }
};
const describePlan = (info: any) => {
      if (!info) return "";

      if (info.pattern === "daily")
        return "Daily wash (except Sundays)";

      if (info.pattern === "alternate")
        return `Alternate day wash (Group ${info.group})`;

      if (info.pattern === "weekly")
        return "Weekly wash (every Monday)";

      return "";
    };

if (!checkedSubscription) {
  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Text>Loading...</Text>
    </View>
  );
}

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Subscription Calendar</Text>

      {subInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.planTitle}>
            {subInfo.type.toUpperCase()} SUBSCRIPTION
          </Text>

          <Text style={styles.planText}>
            {describePlan(subInfo)}
          </Text>

          <Text style={styles.planText}>
            Start Date: {new Date(subInfo.start).toDateString()}
          </Text>
        </View>
      )}
      <Calendar
        key={selectedMonth}
        current={`${selectedMonth}-01`}
        onDayPress={handleDayPress}
        markingType={"custom"}
        markedDates={markedDates}
        onMonthChange={handleMonthChange}
        theme={{
          todayTextColor: "#007bff",
          arrowColor: "#007bff",
        }}
      />
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Car not washed
            </Text>

            <Text style={{ marginBottom: 10 }}>
              Reason: {reasonLabels[selectedInfo?.reason] || selectedInfo?.reason}
            </Text>

            {selectedInfo?.image ? (
              <Image
                source={{ uri: `http://192.168.31.81:5000/${selectedInfo.image}` }}
                style={{ width: 220, height: 220, borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : (
              <Text>No image uploaded</Text>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },

  closeBtn: {
    marginTop: 15,
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  infoCard: {
    backgroundColor: "#f3f6ff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  planTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
  },

  planText: {
    fontSize: 14,
    marginTop: 4,
    color: "#444",
  },
});