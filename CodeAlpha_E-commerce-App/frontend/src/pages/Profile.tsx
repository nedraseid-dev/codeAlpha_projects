import { useState } from "react";
import { profileApi } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");
    try {
      const updated = await profileApi.update({ name });
      updateUser(updated);
      setSuccess(true);
    } catch {
      setError("Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: 48 }}>
      <h2>Profile</h2>
      <p style={{ color: "#4a4a44", margin: "8px 0 24px" }}>{user?.email}</p>
      <form className="form" onSubmit={submit}>
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        {success && <p style={{ color: "green", fontSize: "0.88rem" }}>Profile updated.</p>}
        <button className="btn" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
