import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import LoadingIndicator from "../components/LoadingIndicator";
import "../styles/Apartment.css";

function Apartment() {
  const [address, setAddress] = useState("");
  const [doorkey, setDoorkey] = useState("");
  const [loading, setLoading] = useState(true);
  const [needsAddress, setNeedsAddress] = useState(false);
  const [mode, setMode] = useState("join"); // 'join' or 'create'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await api.get("/api/tenant/");
        if (!res.data?.address) {
          setNeedsAddress(true);
        } else {
          navigate("/");
        }
      } catch (error) {
        alert(
          "Error fetching tenant info: " +
            (error?.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "join") {
        await api.post("/api/apartment/join/", { address, doorkey });
      } else if (mode === "create") {
        await api.post("/api/apartment/create/", { address, doorkey });
      }
      navigate("/");
    } catch (error) {
      alert("Error: " + (error?.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!needsAddress) return null;

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>
        {mode === "join"
          ? "Join an Existing Apartment"
          : "Create a New Apartment"}
      </h1>

      <div>
        <button onClick={() => setMode("join")} disabled={mode === "join"}>
          Join Apartment
        </button>
        <button onClick={() => setMode("create")} disabled={mode === "create"}>
          Create Apartment
        </button>
      </div>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        required
      />
      <input
        type="text"
        value={doorkey}
        onChange={(e) => setDoorkey(e.target.value)}
        placeholder="Doorkey"
        required
      />
      {loading && <LoadingIndicator />}
      <button type="submit" disabled={loading}>
        {mode === "join" ? "Join" : "Create"}
      </button>
    </form>
  );
}

export default Apartment;
