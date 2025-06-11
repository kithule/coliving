import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import LoadingIndicator from "../components/LoadingIndicator";

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
    <div>
      <h2>
        {mode === "join"
          ? "Join an Existing Apartment"
          : "Create a New Apartment"}
      </h2>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setMode("join")} disabled={mode === "join"}>
          Join Apartment
        </button>
        <button onClick={() => setMode("create")} disabled={mode === "create"}>
          Create Apartment
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label>{mode === "join" ? "Doorkey:" : "Set a Doorkey:"}</label>
          <input
            type="text"
            value={doorkey}
            onChange={(e) => setDoorkey(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {mode === "join" ? "Join" : "Create"}
        </button>
      </form>
    </div>
  );
}

export default Apartment;
