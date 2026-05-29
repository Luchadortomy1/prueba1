import { supabase } from './supabaseClient';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'waiter';
  restaurant_id: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Login simple con usuario y contraseña (DEMO - en producción usar Auth de Supabase)
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return { success: false, error: 'Usuario o contraseña inválido' };
    }

    return {
      success: true,
      user: {
        id: data.id,
        username: data.username,
        role: data.role,
        restaurant_id: data.restaurant_id,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function logout() {
  return { success: true };
}
