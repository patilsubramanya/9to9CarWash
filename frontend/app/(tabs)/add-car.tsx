import { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
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
  Hyundai: [
    "i20",
    "i10 Grand",
    "Creta",
    "Venue",
    "Verna",
    "Aura",
  ],
  Tata: [
    "Nexon",
    "Punch",
    "Altroz",
    "Harrier",
    "Safari",
    "Tiago",
  ],
  Honda: [
    "City",
    "Amaze",
    "Jazz",
    "WR-V"
  ],
};

  const router = useRouter();
  // const params = useLocalSearchParams(); // contains user_id or token you passed from home

  const [token, setToken] = useState<string | null>(null);
  const [pincode, setPincode] = useState("560094");
  const [area, setArea] = useState("KEB Layout");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [image, setImage] = useState("");

  const API = "http://192.168.0.105:5000";

  // pincode options
  const PINCODES = ["560094", "560095", "560096"];
  const AREAS = ["KEB Layout", "Nagawara", "RT Nagar"];

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
      setImage(result.assets[0].base64|| "");
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      return Alert.alert("Error", "Token not loaded yet. Try again.");
    }
    if (pincode !== "560094") {
      return Alert.alert("Coming Soon", "We are coming soon to your area.");
    }

    if (area !== "KEB Layout") {
      return Alert.alert("Coming Soon", "We are coming soon to your area.");
    }

    if (!make || !model || !regNumber) {
      return Alert.alert("Missing Fields", "Please fill all car details.");
    }

    try {
      const res = await axios.post(`${API}/auth/add-car`, {
        token,     // You passed token from home screen
        pincode,
        area,
        make,
        model,
        color,
        registration_number: regNumber,
        car_photo: image          // base64 string
      });

      Alert.alert("Success", "Car added successfully!", [
        { text: "OK", onPress: () => router.replace({pathname: "/thankyou", params: {token}}) }
      ]);
      
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Add Your Car</Text>

      <TextInput
        label="Pincode"
        value={pincode}
        onChangeText={setPincode}
        style={styles.input}
      />

      <TextInput
        label="Area"
        value={area}
        onChangeText={setArea}
        style={styles.input}
      />

      {/* Make Dropdown */}
      <Text style={styles.label}>Make</Text>
      <Picker
      selectedValue={make}
      onValueChange={(value) => {
        setMake(value);
        setModel(""); // Reset model when make changes
        }}
        style={styles.picker}
      >
        <Picker.Item label="Select Make" value="" />
        {Object.keys(CAR_DATA).map((brand) => (
          <Picker.Item key={brand} label={brand} value={brand} />
        ))}
      </Picker>
      
      {/* Model Dropdown */}
      <Text style={styles.label}>Model</Text>
      <Picker
      selectedValue={model}
      enabled={make !== ""}   // Only enable if make was selected
      onValueChange={(value) => setModel(value)}
      style={styles.picker}
      >
        <Picker.Item label="Select Model" value="" />
        {make !== "" &&
        CAR_DATA[make as keyof typeof CAR_DATA].map((m) => (
        <Picker.Item key={m} label={m} value={m} />
        ))}
      </Picker>

      <TextInput label="Color" value={color} onChangeText={setColor} style={styles.input} />
      <TextInput label="Registration Number" value={regNumber} onChangeText={(text) => setRegNumber(text.toUpperCase())} style={styles.input}  />

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={{ textAlign: "center", color: "#555" }}>Upload Car Photo (Optional)</Text>
      </TouchableOpacity>

      {image ? <Image source={{ uri: "data:image/jpeg;base64," + image }} style={styles.preview} /> : null}

      <Button mode="contained" onPress={handleSubmit} style={styles.btn}>
        Submit
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "white", padding: 20, justifyContent: "center",
  },
  input: { backgroundColor: "#f2f2f2", marginBottom: 12 },
  btn: { marginTop: 10, backgroundColor: "#007bff" },
  title: { textAlign: "center", marginBottom: 20 },
  imagePicker: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    borderRadius: 8
  },
  preview: {
    width: "100%",
    height: 150,
    marginBottom: 10,
    borderRadius: 8,
  },
  label: {
  marginTop: 10,
  marginBottom: 5,
  fontSize: 16,
  fontWeight: "600",
  },
  picker: {
  backgroundColor: "#f2f2f2",
  marginBottom: 12,
  borderRadius: 8,
},

});
