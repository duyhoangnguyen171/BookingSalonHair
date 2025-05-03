import React, { useState } from "react";

const Login = () => {
  const [state, setState] = useState("Sign Up");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // const onSubmitHandler = async (event) => {
  //   event.preventDefault();
  // };

  return (
    <form className="min-h-[80vh] flex items-center ">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border border-zinc-300  rounded-2xl text-sm shadow-lg  ">
        <p className="text-2xl font-semibold">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>
        <p className="">
          Plase {state === "Sign Up" ? "sign up" : "log in"} to bool appointment
        </p>
        {state === "Sign Up" && (
          <div className="w-full">
            <p className="">Full name</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setName(e.target.name)}
              value={name}
            />
          </div>
        )}

        <div className="w-full">
          <p className="">Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.email)}
            value={email}
          />
        </div>
        <div className="w-full">
          <p className="">Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.password)}
            value={password}
          />
        </div>
        <button className="bg-blue-500 w-full px-4 py-3 rounded-2xl hover:bg-blue-300 text-white cursor-pointer">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>
        {state === "Sign Up" ? (
          <p>
            Already have an account ?
            <span
              onClick={() => setState("Login")}
              className="text-blue-500 underline cursor-pointer ml-2"
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Don't have an account ?
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-500 underline cursor-pointer ml-2"
            >
              Sign up here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
