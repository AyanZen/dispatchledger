import { useState } from "react";
import Modal from "../common/Modal";
import { validatePassword } from "@/lib/password";
import { ROLES } from "@/lib/roles";

export default function UserForm({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.STAFF);
  const [err, setErr] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) { setErr("All fields are required."); return; }
    const passwordError = validatePassword(password);
    if (passwordError) { setErr(passwordError); return; }
    onSubmit({ name: name.trim(), email: email.trim(), password, role });
  }

  return (
    <Modal title="Add employee" onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field-label">Full name *</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <label className="field-label">Email *</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        <label className="field-label">Password *</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="hint-text">At least 8 characters with a letter and a number.</p>
        <label className="field-label">Role</label>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value={ROLES.STAFF}>Staff</option>
          <option value={ROLES.ADMIN}>Admin</option>
        </select>
        <p className="hint-text">Admins can manage franchises, employees, and settings. Super admin is configured via environment only.</p>
        {err && <div className="form-error">{err}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Add employee</button>
        </div>
      </form>
    </Modal>
  );
}
