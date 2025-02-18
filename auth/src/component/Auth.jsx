import { Github, Mail, LockKeyhole, EyeOff, Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/helper/supabaseClient";

const Auth = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("Session Data:", data?.session?.user);
      setUser(data?.session?.user || null);
      if (error) {
        console.error("Error fetching session:", error.message);
      }
    };

    getSession(); // Run once on mount

    // Listen for session changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUpNewUser = async (userEmail, userPassword) => {
    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: userPassword,
    });

    if (error) {
      console.error("Signup Error:", error.message);
      return;
    }

    // Insert user details into your table after signup
    const { data: userData, error: insertError } = await supabase
      .from("users") // Replace with your table name
      .insert([
        {
          email: userEmail,
          password: userPassword, // In a real application, never store plain text passwords
          created_at: new Date(),
        },
      ]);

    if (insertError) {
      console.error("Database Insert Error:", insertError.message);
      return;
    }

    setUser(data.user); // Update user state
    console.log("Signup Success:", data);
  };

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      console.error("Login Error:", error.message);
      return;
    }

    setUser(data.user); // Update user state
    console.log("Login Success:", data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); // Reset user state on logout
  };

  return (
    <div>
      {!user ? (
        <div>
          <div className="relative bg-gray-200 mx-auto flex items-center justify-center h-screen">
            <div className="border-4 border-gray-400 p-5 rounded-lg bg-white flex flex-col items-center justify-center">
              <h1 className="font-bold p-2 text-2xl rounded-lg">
                {isLogin ? "Login" : "SignUp"}
              </h1>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium p-3 mb-3">Email</span>
                  </label>
                  <div className="relative mt-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="/40 size-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.email}
                      className="input input-bordered w-full pl-10 p-3"
                      placeholder="you@example.com"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label-text font-medium mb-3 p-3">Password</label>
                  <div className="relative mt-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockKeyhole className="/40 size-5" />
                    </div>
                    <input
                      className="w-full pl-10 p-3 input input-bordered"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button
                  className="text-center bg-sky-500 flex items-center cursor-pointer justify-center w-full p-3 border-2 rounded-lg"
                  type="button"
                  onClick={isLogin ? login : () => signUpNewUser(formData.email, formData.password)}
                >
                  {isLogin ? "Login" : "SignUp"}
                </button>
              </form>

              <div className="text-gray-400 m-4">OR</div>

              <button
                className="flex flex-row item-center justify-center p-4 border-1 cursor-pointer rounded-lg"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Create an account" : "Login with Email"}
              </button>
              <div className="text-gray-400 m-4">OR</div>

              <button
                className="flex flex-row item-center justify-center bg-black text-white p-4 border-1 cursor-pointer rounded-lg"
                onClick={login}
              >
                <Github className="size-6 mr-3" /> Login With GitHub
              </button>
            
            </div>
          </div>
        </div>
      ) : (
        <div className="relative bg-gray-200 mx-auto flex items-center justify-center h-screen">
          <div className="flex flex-col items-center justify-center text-2xl font-bold">
            Authenticated
            <button
              onClick={signOut}
              className="bg-red-500 mt-6 cursor-pointer p-2 font-bold text-white border-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
