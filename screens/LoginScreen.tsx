import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { login } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      Alert.alert('Error', result.error || 'Error en login');
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    const result = await login(user, pass);
    setLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      Alert.alert('Error', result.error || 'Error en login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>POS Restaurant</Text>
        <Text style={styles.subtitle}>Sistema de Órdenes</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor={COLORS.textTertiary}
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Ingresando...' : 'INGRESAR'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.quickLoginTitle}>Acceso Rápido</Text>

        <TouchableOpacity
          style={[styles.quickButton, styles.adminButton]}
          onPress={() => handleQuickLogin('admin', '123456')}
          disabled={loading}
        >
          <Text style={styles.quickButtonText}>Admin (123456)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickButton, styles.waiterButton]}
          onPress={() => handleQuickLogin('mesero', '654321')}
          disabled={loading}
        >
          <Text style={styles.quickButtonText}>Mesero (654321)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickButton, styles.kitchenButton]}
          onPress={() => handleQuickLogin('cocina', '098765')}
          disabled={loading}
        >
          <Text style={styles.quickButtonText}>Cocina (098765)</Text>
        </TouchableOpacity>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 30,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  loginButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  quickLoginTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  quickButton: {
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
  },
  adminButton: {
    borderColor: COLORS.buttonGreen,
    backgroundColor: COLORS.buttonGreen + '15',
  },
  waiterButton: {
    borderColor: COLORS.buttonBlue,
    backgroundColor: COLORS.buttonBlue + '15',
  },
  kitchenButton: {
    borderColor: COLORS.warning,
    backgroundColor: COLORS.warning + '15',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  note: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});
