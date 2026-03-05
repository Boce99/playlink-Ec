
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { PlayLinkLogo } from "@/components/PlayLinkLogo";

type Mode = "signin" | "signup";
type UserType = "player" | "club";

export default function AuthScreen() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signInWithGitHub, loading: authLoading } =
    useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [userType, setUserType] = useState<UserType>("player");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A9BF0" />
      </View>
    );
  }

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        if (userType === "club") {
          router.replace("/(club)");
        } else {
          router.replace("/(tabs)/(home)");
        }
      } else {
        await signUpWithEmail(email, password, name);
        Alert.alert(
          "Éxito",
          "¡Cuenta creada! Por favor verifica tu email."
        );
        if (userType === "club") {
          router.replace("/(club)");
        } else {
          router.replace("/(tabs)/(home)");
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Autenticación fallida");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "apple" | "github") => {
    setLoading(true);
    try {
      if (provider === "google") {
        await signInWithGoogle();
      } else if (provider === "apple") {
        await signInWithApple();
      } else if (provider === "github") {
        await signInWithGitHub();
      }
      if (userType === "club") {
        router.replace("/(club)");
      } else {
        router.replace("/(tabs)/(home)");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Autenticación fallida");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <PlayLinkLogo size={140} variant="full" />
          <Text style={styles.subtitle}>Gestión de Clubes de Pádel</Text>

          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "player" && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType("player")}
            >
              <Text
                style={[
                  styles.userTypeText,
                  userType === "player" && styles.userTypeTextActive,
                ]}
              >
                Jugador
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "club" && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType("club")}
            >
              <Text
                style={[
                  styles.userTypeText,
                  userType === "club" && styles.userTypeTextActive,
                ]}
              >
                Club
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {mode === "signin" ? "Iniciar Sesión" : "Registrarse"}
          </Text>

          {mode === "signup" && (
            <TextInput
              style={styles.input}
              placeholder="Nombre (opcional)"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === "signin" ? "Iniciar Sesión" : "Registrarse"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            <Text style={styles.switchModeText}>
              {mode === "signin"
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia Sesión"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continuar con</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialAuth("google")}
            disabled={loading}
          >
            <Text style={styles.socialButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={() => handleSocialAuth("apple")}
              disabled={loading}
            >
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                Continuar con Apple
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    marginTop: 16,
    textAlign: "center",
    color: "#333333",
  },
  userTypeContainer: {
    flexDirection: "row",
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    overflow: "hidden",
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  userTypeButtonActive: {
    backgroundColor: "#4A9BF0",
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  userTypeTextActive: {
    color: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#000000",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  primaryButton: {
    height: 50,
    backgroundColor: "#4A9BF0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  switchModeButton: {
    marginTop: 16,
    alignItems: "center",
  },
  switchModeText: {
    color: "#4A9BF0",
    fontSize: 14,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#333333",
    fontSize: 14,
  },
  socialButton: {
    height: 50,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  socialButtonText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  appleButton: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  appleButtonText: {
    color: "#fff",
  },
});
