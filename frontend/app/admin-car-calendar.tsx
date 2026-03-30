import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function AdminCarCalendar() {
  const { userId, carId } = useLocalSearchParams();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [details, setDetails] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [carInfo, setCarInfo] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  const loadCalendar = async (month: string) => {
    const token = await SecureStore.getItemAsync("token");

    const res = await axios.get(
      `http://192.168.31.81:5000/admin/user/${userId}/car/${carId}/calendar?month=${month}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;

    const marks: any = {};

    data.scheduled.forEach((d: string) => {
      marks[d] = {
        customStyles: {
          container: { borderWidth: 2, borderColor: "#007bff", borderRadius: 8 },
          text: { color: "#000" }
        }
      };
    });

    data.pending.forEach((d: string) => {
      marks[d] = {
        customStyles: {
          container: { backgroundColor: "#ffc107", borderRadius: 8 },
          text: { color: "#000" }
        }
      };
    });

    data.pending_approval.forEach((d: string) => {
      marks[d] = {
        customStyles: {
          container: { backgroundColor: "#fd7e14", borderRadius: 8 },
          text: { color: "#fff" }
        }
      };
    });

    data.washed.forEach((d: string) => {
      marks[d] = {
        customStyles: {
          container: { backgroundColor: "#28a745", borderRadius: 8 },
          text: { color: "#fff" }
        }
      };
    });

    data.not_washed.forEach((d: string) => {
      marks[d] = {
        customStyles: {
          container: { backgroundColor: "#dc3545", borderRadius: 8 },
          text: { color: "#fff" }
        }
      };
    });

    setMarkedDates(marks);
    setDetails(data.details);
    setCarInfo(data.car_info);
    setSummary(data.monthly_summary);
  };

  useEffect(() => {
    loadCalendar(selectedMonth);
  }, [selectedMonth, userId, carId]);

  function Legend({ color, label }: any) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function SummaryItem({ label, value }: any) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

  return (
    <ScreenContainer>
      <View style={{ paddingHorizontal: 4 }}>
        {carInfo && (
          <Card>
            <Text style={styles.carTitle}>
              {carInfo.make} {carInfo.model}
            </Text>
            <Text style={styles.metaText}>
              {carInfo.registration_number}
            </Text>
          </Card>
        )}
        {summary && (
          <Card>
            <Text style={styles.summaryTitle}>
              Monthly Summary
            </Text>

            <View style={styles.summaryRow}>
              <SummaryItem label="Total" value={summary.total} />
              <SummaryItem label="Washed" value={summary.washed} />
              <SummaryItem label="Missed" value={summary.not_washed} />
              <SummaryItem label="Pending" value={summary.pending} />
            </View>
          </Card>
        )}
        <View style={styles.legendContainer}>
          <Legend color="#28a745" label="Washed" />
          <Legend color="#dc3545" label="Not Washed" />
          <Legend color="#ffc107" label="Pending" />
          <Legend color="#fd7e14" label="Pending Approval" />
          <Legend color="#007bff" label="Scheduled" />
        </View>
        <Calendar
          current={`${selectedMonth}-01`}
          markingType={"custom"}
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          onMonthChange={(m) =>
            setSelectedMonth(m.dateString.slice(0, 7))
          }
          theme={{
            todayTextColor: "#2563EB",
            arrowColor: "#2563EB",
            monthTextColor: "#111827",
            textDayFontWeight: "500",
            textMonthFontWeight: "700",
            textDayHeaderFontWeight: "600",
          }}
          style={{
            borderRadius: 16,
            backgroundColor: "#ffffff",
            paddingBottom: 10,
          }}
        />
        <Modal visible={!!selectedDate} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <Card style={{ width: "90%" }}>
              {selectedDate && details[selectedDate] ? (
                <>
                  <Text style={styles.modalDate}>{selectedDate}</Text>

                  <View style={styles.statusRow}>
                    <Text style={styles.statusText}>
                      {details[selectedDate].status}
                    </Text>
                  </View>

                  {details[selectedDate].reason_code && (
                    <>
                      <Text style={styles.sectionLabel}>Reason</Text>
                      <Text style={styles.sectionValue}>
                        {details[selectedDate].reason_code}
                      </Text>
                    </>
                  )}

                  {details[selectedDate].note && (
                    <>
                      <Text style={styles.sectionLabel}>Note</Text>
                      <Text style={styles.sectionValue}>
                        {details[selectedDate].note}
                      </Text>
                    </>
                  )}

                  {details[selectedDate].proof_image && (
                    <Image
                      source={{
                        uri: `http://192.168.31.81:5000/${details[
                          selectedDate
                        ].proof_image.replace(/\\/g, "/")}`,
                      }}
                      style={styles.proofImage}
                      resizeMode="cover"
                    />
                  )}
                </>
              ) : (
                <Text style={styles.sectionValue}>
                  No record for this date
                </Text>
              )}

              <PrimaryButton
                title="Close"
                onPress={() => setSelectedDate(null)}
              />
            </Card>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  carTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#111827",
},

metaText: {
  marginTop: 4,
  fontSize: 13,
  color: "#6B7280",
},

legendContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
  marginBottom: 8,
},

legendItem: {
  flexDirection: "row",
  alignItems: "center",
  marginRight: 16,
  marginBottom: 6,
},

legendDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  marginRight: 6,
},

legendText: {
  fontSize: 12,
  color: "#374151",
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

modalDate: {
  fontSize: 18,
  fontWeight: "700",
  marginBottom: 10,
},

statusRow: {
  marginBottom: 10,
},

statusText: {
  fontSize: 14,
  fontWeight: "600",
},

sectionLabel: {
  fontSize: 13,
  fontWeight: "600",
  marginTop: 10,
},

sectionValue: {
  fontSize: 13,
  color: "#4B5563",
  marginTop: 4,
},

proofImage: {
  width: "100%",
  height: 180,
  borderRadius: 12,
  marginTop: 12,
},
summaryTitle: {
  fontSize: 14,
  fontWeight: "600",
  marginBottom: 12,
  color: "#111827",
},

summaryRow: {
  flexDirection: "row",
  justifyContent: "space-between",
},

summaryItem: {
  alignItems: "center",
},

summaryValue: {
  fontSize: 18,
  fontWeight: "700",
  color: "#111827",
},

summaryLabel: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 4,
},
});