import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { auth } from "@/firebase";
import { COLORS, FONT_SIZE } from "@/constants/theme";
import { getDatabase, ref, set } from "firebase/database";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Register";
    }
  }, []);

  const handleRegister = async () => {
    console.log("Register", email, password, confirmPassword);

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const db = getDatabase();
      const usersRef = ref(db, `users/${user.uid}`);
      await set(usersRef, {
        id: user.uid,
        email: user.email,
      });

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.form_login}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          autoComplete="off"
          textContentType="emailAddress"
          returnKeyType="next"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          autoCapitalize="none"
          textContentType="password"
          returnKeyType="next"
          autoComplete="off"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={true}
          autoCapitalize="none"
          textContentType="password"
          returnKeyType="next"
          autoComplete="off"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text>Register</Text>
        </TouchableOpacity>
        <Link href="/home" style={styles.link}>
          <Text style={styles.linkText}>Login</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZE.xLarge,
    fontWeight: "bold",
  },
  form_login: {
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderColor: COLORS.border,
    borderRadius: 10,
  },
  button: {
    width: "75%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.link,
  },
});
