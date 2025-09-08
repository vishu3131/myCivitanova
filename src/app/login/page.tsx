"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUnifiedAuth from '@/hooks/useUnifiedAuth';
import { FaGoogle } from 'react-icons/fa';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    sendPasswordResetEmail,
    updateUserProfile,
  } = useUnifiedAuth();

  useEffect(() => {
    if (user) {
      // Optional: Redirect if user is already logged in
      // router.push('/profile');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (isLogin) {
      try {
        await login(formData.email, formData.password);
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      try {
        const newUser = await signup(formData.email, formData.password);
        if (newUser) {
          await updateUserProfile({
            displayName: formData.username,
            // photoURL: 'some-default-photo-url' // if you have one
          });
          // Additional logic to save other form data to your database
        }
        setSuccessMessage('Registration successful! Please log in.');
        setIsLogin(true); // Switch to login form
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-teal-400">
          {isLogin ? 'Accedi' : 'Registrati'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Nome Completo"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Telefono"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          {!isLogin && (
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Conferma Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

          {isLogin && (
            <div className="text-right">
              <a 
                href="/forgot-password" 
                className="text-sm text-teal-400 hover:text-teal-300 hover:underline"
              >
                Password dimenticata?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
          </button>
        </form>

        <div className="flex items-center justify-center">
          <button
            onClick={loginWithGoogle}
            className="flex items-center justify-center w-full px-4 py-2 mt-4 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaGoogle className="mr-2" />
            Accedi con Google
          </button>
        </div>

        <p className="text-sm text-center">
          {isLogin ? "Non hai un account?" : "Hai già un account?"}{' '}
          <button onClick={toggleMode} className="font-medium text-teal-400 hover:underline">
            {isLogin ? 'Registrati' : 'Accedi'}
          </button>
        </p>
        <div className="text-center">
          <a href="/" className="text-sm text-gray-400 hover:underline">
            Torna alla home
          </a>
        </div>
      </div>
    </div>
  );
}
