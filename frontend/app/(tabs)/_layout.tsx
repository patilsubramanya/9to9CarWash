import { Tabs } from "expo-router";


export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="adminhome" options={{ title: "Admin" }} />
      <Tabs.Screen name="supervisorhome" options={{ title: "Supervisor" }} />
      <Tabs.Screen name="washerhome" options={{ title: "Washer" }} />
    </Tabs>
  );
}
