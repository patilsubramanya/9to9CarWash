// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// import { Stack } from "expo-router";
// import { View } from "react-native";

// export default function RootLayout() {
// return (
//   <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
//     <Stack screenOptions={{ headerShown: false }} />
//   </View>
// );
// }
// }

import { Slot, useRouter, Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        router.replace("/"); // go to login
      } else {
        router.replace("/(tabs)/home"); // go to home
      }
    };

    checkToken();
  }, []);

  // return <Slot />;   // load nested screens
  return (
    // <Slot />
    <View style={{ flex: 1, backgroundColor: "#D3D3D3" }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
