import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./features/auth/hooks/useAuth";
import LoginForm from "./features/auth/components/LoginForm";
import RegisterForm from "./features/auth/components/RegisterForm";

function AuthPages() {
  const { user, loading, error, login, register, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigate("/dashboard");
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string
  ) => {
    await register(name, email, password);
    navigate("/login");
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              loading={loading}
              error={error}
            />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          user ? (
            <div className="p-8">
              <h1 className="text-2xl font-bold">
                Welcome, {user.name}!
              </h1>
              <p>{user.email}</p>
              <p>Role: {user.role}</p>
              <button
                onClick={logout}
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AuthPages />;
}