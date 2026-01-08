import React, { createContext, useContext, useState, useEffect } from "react";
import { initDB, executeSql } from "../db";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initDB(); // ensure DB + users table exists
      } catch (e) {
        console.error("DB init error:", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const register = async (username, email, password) => {
    try {
      await executeSql(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?);",
        [username.trim(), email.trim().toLowerCase(), password]
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Username oder Email existiert schon." };
    }
  };

  const login = async (identifier, password) => {
    const res = await executeSql(
      "SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ? LIMIT 1;",
      [identifier.trim(), identifier.trim().toLowerCase(), password]
    );

    if (res.rows.length > 0) {
      const foundUser = res.rows.item(0);
      setUser(foundUser);
      return { ok: true };
    }
    return { ok: false, error: "Ungültige Login-Daten" };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, register, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
