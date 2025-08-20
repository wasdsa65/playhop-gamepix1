// 动态导入包装器，避免构建时的模块检查错误

export async function safeImportFirebase() {
  try {
    return await import('./firebase');
  } catch (error) {
    console.warn('Firebase module not available:', error);
    return null;
  }
}

export async function safeImportSupabase() {
  try {
    return await import('./supabase');
  } catch (error) {
    console.warn('Supabase module not available:', error);
    return null;
  }
}
