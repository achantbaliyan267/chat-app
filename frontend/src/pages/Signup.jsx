import { useState } from "react";
import API from "../services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/signup", form);

      dispatch(setUser(data));

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
        />

        <button className="w-full bg-blue-500 text-white py-2 rounded">
          Signup
        </button>
      </form>
      <Link
        to="/login"
        className="block text-center mt-4 text-sm text-gray-600"
      >
        Have an account? Login
      </Link>
    </div>
  );
};

export default Signup;
