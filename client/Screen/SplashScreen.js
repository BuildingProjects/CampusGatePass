import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Image } from "react-native";
import { Video } from "expo-av";

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef(null);

  useEffect(() => {
    console.log(require("../assets/inout-intro.mp4"));
    // Fade in animation for logo/text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Navigate after video finishes (or fallback delay)
    const timer = setTimeout(() => {
      navigation.replace("RoleSelector"); // change if needed
    }, 50000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background video */}
      <Video
        ref={videoRef}
        source={require("../assets/inout-intro.mp4")}
        style={StyleSheet.absoluteFill}
        resizeMode='cover'
        shouldPlay
        isLooping={false}
        isMuted
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            navigation.replace("RoleSelector");
          }
        }}
      />

      {/* Overlay content */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* <Image
          source={require("../assets/inout-logo.png")}
          style={styles.logo}
          resizeMode='contain'
        /> */}
        {/* <Text style={styles.appName}>InOut</Text>
        <Text style={styles.tagline}>Smart Entry. Simplified.</Text> */}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)", // slight dark overlay for contrast
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    tintColor: "#3B82F6",
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 2,
  },
  tagline: {
    color: "#CBD5E1",
    fontSize: 14,
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
