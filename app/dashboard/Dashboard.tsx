"use client";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type ServiceRecord = {
  oilChangeDate: string; currentKm: number; dueKm: number; archivedAt?: string;
  airFilter?: boolean; oilFilter?: boolean; oilQuantity?: number | null; oilBrand?: string;
  acFilter?: boolean; brakeService?: boolean; brakeShoe?: boolean;
};
type Client = {
  _id?: string; name: string; phone: string; car: string;
  oilChangeDate: string; currentKm: number; dueKm: number;
  airFilter?: boolean; oilFilter?: boolean; oilQuantity?: number | null; oilBrand?: string;
  acFilter?: boolean; brakeService?: boolean; brakeShoe?: boolean;
  nextReminderAt?: string; history?: ServiceRecord[];
};

const emptyForm = {
  name: "", phone: "", car: "", oilChangeDate: "", currentKm: "", dueKm: "",
  airFilter: false, oilFilter: false, oilQuantity: "", oilBrand: "",
  acFilter: false, brakeService: false, brakeShoe: false,
};
const emptyService = {
  oilChangeDate: "", currentKm: "", dueKm: "",
  airFilter: false, oilFilter: false, oilQuantity: "", oilBrand: "",
  acFilter: false, brakeService: false, brakeShoe: false,
};

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function serviceMeta(r: ServiceRecord | Client) {
  const parts: string[] = [];
  if (r.oilQuantity) parts.push(`${r.oilQuantity} L`);
  if (r.oilBrand) parts.push(r.oilBrand);
  if (r.airFilter) parts.push("Air filter ✓");
  if (r.oilFilter) parts.push("Oil filter ✓");
  if (r.acFilter) parts.push("AC filter ✓");
  if (r.brakeService) parts.push("Brake service ✓");
  if (r.brakeShoe) parts.push("Brake shoe ✓");
  return parts.join("  ·  ");
}

export default function Dashboard({ shopName }: { shopName: string }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<"all" | "due" | "ok">("all");
  const [query, setQuery] = useState("");
  const [sentToday, setSentToday] = useState(0);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", car: "" });
  const [serviceForm, setServiceForm] = useState(emptyService);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]));
  }, []);

  function reminderDate(c: Client): Date | null {
    if (c.nextReminderAt) return new Date(c.nextReminderAt);
    const d = new Date(c.oilChangeDate);
    if (isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + 1);
    return d;
  }
  function isDue(c: Client) {
    const rd = reminderDate(c);
    const dateDue = rd ? new Date() >= rd : false;
    const kmDue = Number(c.dueKm) - Number(c.currentKm) <= 500;
    return dateDue || kmDue;
  }

  const now = new Date();
  const visitedThisMonth = clients.filter((c) => {
    const d = new Date(c.oilChangeDate);
    return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const dueClients = clients.filter(isDue);
  const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const fmtNum = (n: number) => Number(n).toLocaleString("en-US");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  function visible() {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter === "due" && !isDue(c)) return false;
      if (filter === "ok" && isDue(c)) return false;
      if (q && !`${c.name} ${c.phone} ${c.car || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  async function addClient() {
    if (!form.name || !form.phone || !form.oilChangeDate || !form.currentKm || !form.dueKm) return;
    setSaving(true);
    const res = await fetch("/api/clients", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const saved = await res.json();
    setSaving(false);
    setClients([saved, ...clients]);
    setForm(emptyForm);
  }

  async function patch(id: string, body: object) {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    return res.json();
  }
  function replaceClient(updated: Client) {
    setClients((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    setEditing((prev) => (prev && prev._id === updated._id ? updated : prev));
  }

  function waNumber(phone: string) {
    let n = phone.replace(/[^0-9]/g, "");
    if (n.startsWith("0")) n = "92" + n.slice(1);
    return n;
  }
  async function sendWhatsApp(c: Client) {
    const msg =
      `Aoa ${c.name}, this is a friendly reminder from ${shopName}. ` +
      `Your ${c.car || "vehicle"} (last serviced on ${c.oilChangeDate}) is due for an oil change at ${c.dueKm}kms. `  +
      `Please visit us at your convenience. JazakAllah!`;
    window.open(`https://wa.me/${waNumber(c.phone)}?text=${encodeURIComponent(msg)}`, "_blank");
    setSentToday((n) => n + 1);
    if (c._id) replaceClient(await patch(c._id, { action: "snooze" }));
  }
  function bulkSend() { dueClients.forEach((c) => sendWhatsApp(c)); }

  function openEdit(c: Client) {
    setEditing(c);
    setEditForm({ name: c.name, phone: c.phone, car: c.car || "" });
    setServiceForm(emptyService);
  }
  async function saveInfo() {
    if (!editing?._id) return;
    replaceClient(await patch(editing._id, { action: "edit", ...editForm }));
  }
  async function logService() {
    if (!editing?._id || !serviceForm.oilChangeDate || !serviceForm.currentKm || !serviceForm.dueKm) return;
    replaceClient(await patch(editing._id, { action: "service", ...serviceForm }));
    setServiceForm(emptyService);
  }
  async function deleteClient(c: Client) {
    if (!c._id) return;
    if (!confirm(`Delete ${c.name}? This permanently removes the client and all service history.`)) return;
    const id = c._id;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients((prev) => prev.filter((x) => x._id !== id));
    setEditing((prev) => (prev && prev._id === id ? null : prev));
  }

  const list = visible();
  const eset = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, [k]: e.target.value });
  const sset = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setServiceForm({ ...serviceForm, [k]: e.target.value });

  const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(6,7,10,.66)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 };
  const modal: React.CSSProperties = { width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto", background: "rgba(22,25,32,.97)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "22px 22px 24px", color: "#EDEEF1", boxShadow: "0 30px 80px rgba(0,0,0,.5)" };
  const sectionLabel: React.CSSProperties = { fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 14, margin: "20px 0 10px", color: "#EDEEF1" };
  const histCol: React.CSSProperties = { padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.07)" };
  const histRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: 13 };
  const metaLine: React.CSSProperties = { fontSize: 12, color: "#8A909A", marginTop: 4 };
  const iconBtn: React.CSSProperties = { marginLeft: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#A1A7B0", borderRadius: 8, cursor: "pointer", verticalAlign: "middle" };
  const deleteBtn: React.CSSProperties = { ...iconBtn, border: "1px solid rgba(224,103,106,.3)", color: "#E0676A" };

  return (
    <main className="app">
      <header className="bar">
        <div className="logo"><span className="dot">🛢</span> OilTrack</div>
        <div className="user">
          <span>{shopName}</span>
          <div className="av">{(shopName || "S").slice(0, 2).toUpperCase()}</div>
          <button onClick={async () => { await signOut(); router.push("/"); }}>Sign out</button>
        </div>
      </header>

      <section className="stats">
        <div className="stat"><div className="k">👥 Total Clients</div><div className="v">{clients.length}</div></div>
        <div className="stat stat--due"><div className="k">🔔 Due for Reminder</div><div className="v">{dueClients.length}</div></div>
        <div className="stat"><div className="k">📤 Sent Today</div><div className="v">{sentToday}</div></div>
        <div className="stat"><div className="k">✅ Visited This Month</div><div className="v">{visitedThisMonth}</div></div>
      </section>

      <div className="bulk">
        <div className="t"><b>{dueClients.length}</b> clients are due for reminders today.</div>
        {dueClients.length > 0 && <button className="btn--oil" onClick={bulkSend}>🚀 Send all due reminders</button>}
      </div>

      <div className="grid">
        <div className="panel">
          <div className="panel__head"><h3>➕ Add client</h3><div className="hint">New service record</div></div>
          <div className="panel__body form">
            <div className="field"><label>Client name <span className="req">*</span></label>
              <input type="text" placeholder="e.g. Bilal Khan" value={form.name} onChange={set("name")} /></div>
            <div className="field"><label>WhatsApp number <span className="req">*</span></label>
              <input type="tel" placeholder="03xx xxxxxxx" value={form.phone} onChange={set("phone")} /></div>
            <div className="field"><label>Car model</label>
              <input type="text" placeholder="e.g. Toyota Corolla" value={form.car} onChange={set("car")} /></div>
            <div className="field"><label>Oil change date <span className="req">*</span></label>
              <input type="date" value={form.oilChangeDate} onChange={set("oilChangeDate")} /></div>
            <div className="row2">
              <div className="field"><label>Current km <span className="req">*</span></label>
                <input type="number" placeholder="45000" value={form.currentKm} onChange={set("currentKm")} /></div>
              <div className="field"><label>Due km <span className="req">*</span></label>
                <input type="number" placeholder="50000" value={form.dueKm} onChange={set("dueKm")} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>Oil quantity</label>
                <select value={form.oilQuantity} onChange={(e) => setForm({ ...form, oilQuantity: e.target.value })}>
                  <option value="">Select…</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} L</option>
                  ))}
                </select></div>
              <div className="field"><label>Oil brand</label>
                <input type="text" placeholder="e.g. Shell Helix 5W-30" value={form.oilBrand} onChange={set("oilBrand")} /></div>
            </div>
            <div className="checks">
              <label className="check">
                <input type="checkbox" checked={form.airFilter} onChange={(e) => setForm({ ...form, airFilter: e.target.checked })} />
                Air filter
              </label>
              <label className="check">
                <input type="checkbox" checked={form.oilFilter} onChange={(e) => setForm({ ...form, oilFilter: e.target.checked })} />
                Oil filter
              </label>
              <label className="check">
                <input type="checkbox" checked={form.acFilter} onChange={(e) => setForm({ ...form, acFilter: e.target.checked })} />
                AC filter
              </label>
              <label className="check">
                <input type="checkbox" checked={form.brakeService} onChange={(e) => setForm({ ...form, brakeService: e.target.checked })} />
                Brake service
              </label>
              <label className="check">
                <input type="checkbox" checked={form.brakeShoe} onChange={(e) => setForm({ ...form, brakeShoe: e.target.checked })} />
                Brake shoe
              </label>
            </div>
            <button className="btn btn--primary" onClick={addClient} disabled={saving}>
              {saving ? "Saving…" : "💾 Save client record"}
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="filterbar">
            <input className="search" type="search" placeholder="Search name, phone, or car…"
              value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="chips">
              <button className={`chip ${filter === "all" ? "is-on" : ""}`} onClick={() => setFilter("all")}>All <span className="cnt">{clients.length}</span></button>
              <button className={`chip ${filter === "due" ? "is-on-due" : ""}`} onClick={() => setFilter("due")}>Due now <span className="cnt">{dueClients.length}</span></button>
              <button className={`chip ${filter === "ok" ? "is-on" : ""}`} onClick={() => setFilter("ok")}>On track <span className="cnt">{clients.length - dueClients.length}</span></button>
            </div>
          </div>
          <div className="showing">Showing {list.length} of {clients.length} clients</div>
          <div className="panel__body" style={{ paddingTop: 8 }}>
            <table>
              <thead><tr><th>Client</th><th>Car</th><th>Last service</th><th>Next reminder</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty">No clients match this filter.</div></td></tr>
                ) : list.map((c) => {
                  const due = isDue(c);
                  const rd = reminderDate(c);
                  return (
                    <tr key={c._id}>
                      <td><div className="who">{c.name}<small>{c.phone}</small></div></td>
                      <td>{c.car || "—"}</td>
                      <td>{c.oilChangeDate}</td>
                      <td><span className="km">{rd ? fmtDate(rd) : "—"}</span></td>
                      <td>{due
                        ? <span className="badge badge--due"><span className="pip"></span>Due now</span>
                        : <span className="badge badge--ok"><span className="pip"></span>On track</span>}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="send" onClick={() => sendWhatsApp(c)} title={`Message ${c.name}`}><WaIcon /> WhatsApp</button>
                        <button style={iconBtn} onClick={() => openEdit(c)} title={`Edit ${c.name}`} aria-label="Edit"><GearIcon /></button>
                        <button style={deleteBtn} onClick={() => deleteClient(c)} title={`Delete ${c.name}`} aria-label="Delete"><TrashIcon /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editing && (
        <div style={overlay} onClick={() => setEditing(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h3 style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 18 }}>{editing.name}</h3>
              <button style={{ background: "transparent", border: "none", color: "#A1A7B0", fontSize: 20, cursor: "pointer" }} onClick={() => setEditing(null)}>×</button>
            </div>

            <div className="form">
              <div style={sectionLabel}>Edit info</div>
              <div className="field"><label>Name</label><input value={editForm.name} onChange={eset("name")} /></div>
              <div className="field"><label>WhatsApp number</label><input value={editForm.phone} onChange={eset("phone")} /></div>
              <div className="field"><label>Car model</label><input value={editForm.car} onChange={eset("car")} /></div>
              <button className="btn btn--primary" onClick={saveInfo}>Save info</button>

              <div style={sectionLabel}>Log new oil change</div>
              <div style={{ fontSize: 12.5, color: "#A1A7B0", marginBottom: 10 }}>Saves the current record to history and resets the reminder to 1 month.</div>
              <div className="field"><label>New oil change date</label><input type="date" value={serviceForm.oilChangeDate} onChange={sset("oilChangeDate")} /></div>
              <div className="row2">
                <div className="field"><label>New current km</label><input type="number" value={serviceForm.currentKm} onChange={sset("currentKm")} /></div>
                <div className="field"><label>New due km</label><input type="number" value={serviceForm.dueKm} onChange={sset("dueKm")} /></div>
              </div>
              <div className="row2">
                <div className="field"><label>Oil quantity</label>
                  <select value={serviceForm.oilQuantity} onChange={(e) => setServiceForm({ ...serviceForm, oilQuantity: e.target.value })}>
                    <option value="">Select…</option>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} L</option>
                    ))}
                  </select></div>
                <div className="field"><label>Oil brand</label>
                  <input type="text" placeholder="e.g. Shell Helix 5W-30" value={serviceForm.oilBrand} onChange={sset("oilBrand")} /></div>
              </div>
              <div className="checks">
                <label className="check">
                  <input type="checkbox" checked={serviceForm.airFilter} onChange={(e) => setServiceForm({ ...serviceForm, airFilter: e.target.checked })} />
                  Air filter
                </label>
                <label className="check">
                  <input type="checkbox" checked={serviceForm.oilFilter} onChange={(e) => setServiceForm({ ...serviceForm, oilFilter: e.target.checked })} />
                  Oil filter
                </label>
                <label className="check">
                  <input type="checkbox" checked={serviceForm.acFilter} onChange={(e) => setServiceForm({ ...serviceForm, acFilter: e.target.checked })} />
                  AC filter
                </label>
                <label className="check">
                  <input type="checkbox" checked={serviceForm.brakeService} onChange={(e) => setServiceForm({ ...serviceForm, brakeService: e.target.checked })} />
                  Brake service
                </label>
                <label className="check">
                  <input type="checkbox" checked={serviceForm.brakeShoe} onChange={(e) => setServiceForm({ ...serviceForm, brakeShoe: e.target.checked })} />
                  Brake shoe
                </label>
              </div>
              <button className="btn--oil" style={{ width: "100%", justifyContent: "center" }} onClick={logService}>✅ Update &amp; archive old record</button>

              <div style={sectionLabel}>Service history</div>
              {(editing.history && editing.history.length > 0) ? (
                <>
                  {[...editing.history].reverse().map((h, i) => (
                    <div key={i} style={histCol}>
                      <div style={histRow}>
                        <span>{h.oilChangeDate}</span>
                        <span className="km">{fmtNum(h.currentKm)} → {fmtNum(h.dueKm)} km</span>
                      </div>
                      {serviceMeta(h) && <div style={metaLine}>{serviceMeta(h)}</div>}
                    </div>
                  ))}
                  <div style={{ ...histCol, borderBottom: "none" }}>
                    <div style={{ ...histRow, color: "#5FD08A", borderBottom: "none" }}>
                      <span>{editing.oilChangeDate} (current)</span>
                      <span className="km">{fmtNum(editing.currentKm)} → {fmtNum(editing.dueKm)} km</span>
                    </div>
                    {serviceMeta(editing) && <div style={metaLine}>{serviceMeta(editing)}</div>}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#7C828C", padding: "8px 0" }}>No past records yet — only the current one.</div>
              )}

              <div style={{ ...sectionLabel, color: "#E0676A" }}>Danger zone</div>
              <div style={{ fontSize: 12.5, color: "#A1A7B0", marginBottom: 10 }}>Permanently delete this client and all service history. This cannot be undone.</div>
              <button
                onClick={() => editing && deleteClient(editing)}
                style={{ width: "100%", border: "1px solid rgba(224,103,106,.4)", background: "rgba(224,103,106,.08)", color: "#E0676A", borderRadius: 10, padding: "11px 14px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                🗑 Delete client
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}