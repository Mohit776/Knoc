import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo pops in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Tagline fades in after logo
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (onFinish) {
      const timer = setTimeout(onFinish, 2800);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Centered Logo */}
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoWrapper,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Image
            source={require('../assets/new_knoc/Logo.svg')} // 👈 Replace with your logo image
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Tagline at bottom */}
      <Animated.View style={[styles.taglineWrapper, { opacity: taglineFade }]}>
        <Text style={styles.tagline}>Make the right entry</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Centered logo */
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.45,
    height: width * 0.45,
   
  },
  logo: {
    width: '80%',
    height: '80%',
  },

  /* Tagline */
  taglineWrapper: {
    paddingBottom: height * 0.08,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
    color: '#111',
    letterSpacing: 0.2,
  },
});
