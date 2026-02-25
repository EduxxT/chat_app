import { Redirect } from 'expo-router';

export default function Index() {
  // Redirige al archivo específico "home"
  return <Redirect href="../home" />;
}