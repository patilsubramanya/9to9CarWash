import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Picker } from "@react-native-picker/picker";

export default function AddCarScreen() {
  const CAR_DATA = {
    "Maruti Suzuki": [
      "Swift",
      "Baleno",
      "Dzire",
      "Brezza",
      "WagonR",
      "Alto",
      "Ertiga",
    ],
    Hyundai: ["i20", "i10 Grand", "Creta", "Venue", "Verna", "Aura"],
    Tata: ["Nexon", "Punch", "Altroz", "Harrier", "Safari", "Tiago"],
    Honda: ["City", "Amaze", "Jazz", "WR-V"],
  };

  const PINCODES = ["560094", "560095", "560096"];
  const AREAS = ["KEB Layout", "Nagawara", "RT Nagar"];

  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [pincode, setPincode] = useState("560094");
  const [area, setArea] = useState("KEB Layout");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [image, setImage] = useState("");

  const API = "http://192.168.31.140:5000";

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync("token");
      setToken(t);
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].base64 || "");
    }
  };

  const handleSubmit = async () => {
    if (!token) return Alert.alert("Error", "Token not loaded yet.");

    if (pincode !== "560094" || area !== "KEB Layout") {
      return Alert.alert("Coming Soon", "We are coming soon to your area.");
    }

    if (!make || !model || !regNumber) {
      return Alert.alert("Missing Fields", "Please fill all car details.");
    }

    try {
      await axios.post(`${API}/auth/add-car`, {
        token,
        pincode,
        area,
        make,
        model,
        color,
        registration_number: regNumber,
        car_photo: image,
      });

      Alert.alert("Success", "Car added successfully!", [
        {
          text: "OK",
          onPress: () =>
            router.replace({ pathname: "/thankyou", params: { token } }),
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.error || "Something went wrong."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.title}>Add Your Car</Text>

          {/* Pincode */}
          <Text style={styles.label}>Pincode</Text>
          <View style={styles.dropdownBox}>
            <Picker selectedValue={pincode} onValueChange={setPincode}>
              {PINCODES.map((pc) => (
                <Picker.Item key={pc} label={pc} value={pc} />
              ))}
            </Picker>
          </View>

          {/* Area */}
          <Text style={styles.label}>Area</Text>
          <View style={styles.dropdownBox}>
            <Picker selectedValue={area} onValueChange={setArea}>
              {AREAS.map((ar) => (
                <Picker.Item key={ar} label={ar} value={ar} />
              ))}
            </Picker>
          </View>

          {/* Make */}
          <Text style={styles.label}>Make</Text>
          <View style={styles.dropdownBox}>
            <Picker
              selectedValue={make}
              onValueChange={(value) => {
                setMake(value);
                setModel("");
              }}
            >
              <Picker.Item label="Select Make" value="" />
              {Object.keys(CAR_DATA).map((brand) => (
                <Picker.Item key={brand} label={brand} value={brand} />
              ))}
            </Picker>
          </View>

          {/* Model */}
          <Text style={styles.label}>Model</Text>
          <View style={styles.dropdownBox}>
            <Picker selectedValue={model} onValueChange={setModel}>
              <Picker.Item label="Select Model" value="" />
              {make !== "" &&
                CAR_DATA[make as keyof typeof CAR_DATA].map((m) => (
                  <Picker.Item key={m} label={m} value={m} />
                ))}
            </Picker>
          </View>

          <TextInput
            label="Color"
            value={color}
            onChangeText={setColor}
            style={styles.input}
          />

          <TextInput
            label="Registration Number"
            value={regNumber}
            onChangeText={(t) => setRegNumber(t.toUpperCase())}
            style={styles.input}
          />

          <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
            <Text style={{ color: "#555", fontWeight: "600" }}>
              Upload Car Photo (Optional)
            </Text>
          </TouchableOpacity>

          {image ? (
            <Image
              source={{ uri: "data:image/jpeg;base64," + image }}
              style={styles.preview}
            />
          ) : null}

          <Button mode="contained" onPress={handleSubmit} style={styles.btn}>
            Submit
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#d3d3d3",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  label: {
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 12,
    fontSize: 15,
  },

  dropdownBox: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#f2f2f2",
    marginBottom: 12,
  },

  uploadBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },

  preview: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
  },

  btn: {
    backgroundColor: "#007bff",
    marginTop: 10,
  },
});
