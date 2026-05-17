import * as SecureStore from "expo-secure-store";

// ── Helpers de IDs ──────────────────────────────────────────────────────────

const getUserIds = async () => {
    try {
        const stored = await SecureStore.getItemAsync("userIds");
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const setUserIds = async (ids) => {
    await SecureStore.setItemAsync("userIds", JSON.stringify(ids));
};

// ── CRUD de usuários ────────────────────────────────────────────────────────

export const getUsers = async () => {
    const ids = await getUserIds();
    const users = [];
    for (const id of ids) {
        try {
            const raw = await SecureStore.getItemAsync(`user_${id}`);
            if (raw) users.push(JSON.parse(raw));
        } catch {}
    }
    return users;
};

export const saveUser = async (user) => {
    // Garante que o email seja sempre salvo em lowercase
    const normalized = { ...user, email: user.email ? user.email.toLowerCase().trim() : user.email };
    const ids = await getUserIds();
    if (!ids.includes(normalized.id)) {
        ids.push(normalized.id);
        await setUserIds(ids);
    }
    await SecureStore.setItemAsync(`user_${normalized.id}`, JSON.stringify(normalized));
};

export const updateUser = async (updatedUser) => {
    // Garante que o email seja sempre salvo em lowercase
    const normalized = { ...updatedUser, email: updatedUser.email ? updatedUser.email.toLowerCase().trim() : updatedUser.email };
    await SecureStore.setItemAsync(`user_${normalized.id}`, JSON.stringify(normalized));
};

export const getNextUserId = async () => {
    const ids = await getUserIds();
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
};

// ── Sessão (userData) ───────────────────────────────────────────────────────

export const getSession = async () => {
    try {
        const raw = await SecureStore.getItemAsync("userData");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setSession = async (user) => {
    await SecureStore.setItemAsync("userData", JSON.stringify(user));
};

export const clearSession = async () => {
    await SecureStore.deleteItemAsync("userData");
};