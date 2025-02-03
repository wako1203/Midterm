import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { View, Text } from 'react-native';


export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text>404 Not Found</Text>
      <Link style={styles.link} href="/home">
        Go to Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
