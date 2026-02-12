import { useState, useEffect, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const APP_NAME = "VERVIS COMEX";
const APP_SUB  = "Centro de Gestión";

const CATEGORIES = [
  "Páginas Oficiales",
  "Cursos",
  "Drive & Archivos",
  "Productos & Cotizaciones",
  "Legal",
  "Finanzas",
  "Correos",
  "Otro",
];

const CAT_META = {
  "Páginas Oficiales":       { color: "#cbd5e1", icon: "🌐" },
  "Cursos":                  { color: "#94a3b8", icon: "🎓" },
  "Drive & Archivos":        { color: "#e2e8f0", icon: "📂" },
  "Productos & Cotizaciones":{ color: "#b0bac7", icon: "📦" },
  "Legal":                   { color: "#cbd5e1", icon: "⚖️"  },
  "Finanzas":                { color: "#94a3b8", icon: "💰" },
  "Correos":                 { color: "#e2e8f0", icon: "✉️"  },
  "Otro":                    { color: "#64748b", icon: "📎" },
};

const STATUS_CFG = {
  pendiente:  { color: "#94a3b8", bg: "rgba(148,163,184,0.10)", label: "Pendiente"  },
  clasificado:{ color: "#e2e8f0", bg: "rgba(226,232,240,0.08)", label: "Clasificado"},
  revisar:    { color: "#cbd5e1", bg: "rgba(203,213,225,0.10)", label: "Revisar"    },
};

const TYPE_META = {
  pdf:  { icon: "📄", color: "#94a3b8" },
  ppt:  { icon: "📊", color: "#b0bac7" },
  link: { icon: "🔗", color: "#cbd5e1" },
  email:{ icon: "✉️",  color: "#e2e8f0" },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_RESOURCES = [
  { id: 1,  name: "AFIP - Aduana Argentina",             type: "link",  category: "Páginas Oficiales",        status: "clasificado", description: "https://www.afip.gob.ar",              createdAt: "2025-01-10", aiSummary: "Portal oficial de AFIP para trámites aduaneros y fiscales.", linkUser: null, linkPass: null },
  { id: 2,  name: "VUCE - Ventanilla Única",             type: "link",  category: "Páginas Oficiales",        status: "clasificado", description: "https://www.vuce.gob.ar",              createdAt: "2025-01-10", aiSummary: "Ventanilla Única de Comercio Exterior para permisos y autorizaciones.", linkUser: null, linkPass: null },
  { id: 3,  name: "Banco Central - Tipos de Cambio",     type: "link",  category: "Páginas Oficiales",        status: "clasificado", description: "https://www.bcra.gob.ar",              createdAt: "2025-01-12", aiSummary: "Cotizaciones oficiales y normativas cambiarias del BCRA.", linkUser: null, linkPass: null },
  { id: 4,  name: "Curso Incoterms 2020 Completo",       type: "link",  category: "Cursos",                   status: "clasificado", description: "https://www.cursoscomex.com/incoterms", createdAt: "2025-01-15", aiSummary: "Curso online sobre Incoterms 2020 aplicados al comercio internacional.", linkUser: "alumno@verviscomex.com", linkPass: "Curso2025!" },
  { id: 5,  name: "Google Drive Vervis Comex",           type: "link",  category: "Drive & Archivos",         status: "clasificado", description: "https://drive.google.com/vervis",       createdAt: "2025-01-20", aiSummary: "Repositorio central de documentos, archivos y recursos del equipo.", linkUser: null, linkPass: null },
  { id: 6,  name: "Carpeta Productos y Cotizaciones",    type: "link",  category: "Productos & Cotizaciones", status: "clasificado", description: "https://drive.google.com/cotizaciones", createdAt: "2025-01-20", aiSummary: "Carpeta con fichas de productos, listas de precios y cotizaciones enviadas.", linkUser: null, linkPass: null },
  { id: 7,  name: "Contrato de Constitución Societaria", type: "pdf",   category: "Legal",                    status: "clasificado", description: "Estatuto y acta constitutiva de Vervis Comex SRL.", createdAt: "2025-02-01", aiSummary: "Documento fundacional con estructura legal, socios y distribución de capital.", linkUser: null, linkPass: null },
  { id: 8,  name: "Proyecciones Financieras 2025",       type: "ppt",   category: "Finanzas",                 status: "clasificado", description: "Flujo de caja, presupuesto anual y escenarios de crecimiento.", createdAt: "2025-02-05", aiSummary: "Análisis financiero proyectado con KPIs, márgenes y metas de exportación.", linkUser: null, linkPass: null },
  { id: 9,  name: "Gmail Empresarial",                   type: "email", category: "Correos",                  status: "clasificado", description: "https://mail.google.com",               createdAt: "2025-02-08", aiSummary: "Correo principal de la empresa en Gmail Workspace.", linkUser: "admin@verviscomex.com", linkPass: "Gm4il#2025" },
  { id: 10, name: "Reglamento Operaciones de Comercio",  type: "pdf",   category: "Legal",                    status: "pendiente",   description: "Normativa interna para operaciones de importación y exportación.", createdAt: "2025-02-10", aiSummary: null, linkUser: null, linkPass: null },
];

const SEED_CREDS = [
  { id: 1, service: "Gmail Vervis",    username: "admin@verviscomex.com", password: "Gm4il#2025",    icon: "📧", visible: false },
  { id: 2, service: "AFIP Clave Fiscal", username: "30-71234567-8",       password: "AFIP$ecure25",  icon: "🏛️", visible: false },
  { id: 3, service: "VUCE",            username: "vervis.comex",          password: "Vuce2025!",     icon: "🌐", visible: false },
  { id: 4, service: "Google Drive",    username: "drive@verviscomex.com", password: "Dr1ve#Safe",    icon: "📂", visible: false },
];

// ─── LOCALSTORAGE HELPERS ─────────────────────────────────────────────────────
const LS_KEY_RES  = "vervis_resources";
const LS_KEY_CRED = "vervis_credentials";

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveLS(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#e2e8f0", error: "#94a3b8", info: "#cbd5e1", warning: "#94a3b8" };
  const icons  = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      background:"#161625", border:`1px solid ${colors[type]||colors.info}`,
      borderLeft:`4px solid ${colors[type]||colors.info}`,
      borderRadius:12, padding:"13px 18px",
      display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 8px 40px rgba(0,0,0,0.5)",
      animation:"slideIn .3s ease", maxWidth:340,
      color:"#e2e8f0", fontSize:14, fontFamily:"'DM Sans',sans-serif"
    }}>
      <span style={{fontSize:18, color:colors[type]||colors.info, fontWeight:700}}>{icons[type]||"ℹ"}</span>
      {message}
    </div>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"2px 10px", borderRadius:20,
      fontSize:11, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase",
      background:`${color}22`, color, border:`1px solid ${color}44`
    }}>{label}</span>
  );
}

function Modal({ onClose, title, icon, children }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
      backdropFilter:"blur(6px)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20
    }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        background:"#161625", border:"1px solid #252545",
        borderRadius:18, padding:28, width:"100%", maxWidth:500,
        animation:"fadeUp .25s ease", maxHeight:"90vh", overflowY:"auto"
      }}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22}}>
          <h3 style={{fontSize:18, fontWeight:700, color:"#f1f5f9", display:"flex", alignItems:"center", gap:8}}>
            <span>{icon}</span>{title}
          </h3>
          <button onClick={onClose} style={{
            background:"#252545", border:"none", color:"#64748b",
            width:32, height:32, borderRadius:8, cursor:"pointer", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const AUTH_USER = "vervis";
const AUTH_PASS = "Vervis@srl1";
const LS_KEY_AUTH = "vervis_auth";

function LoginScreen({ onLogin }) {
  const [user,    setUser]    = useState("");
  const [pass,    setPass]    = useState("");
  const [showP,   setShowP]   = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!user.trim() || !pass.trim()) { setError("Completá usuario y contraseña"); return; }
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (user === AUTH_USER && pass === AUTH_PASS) {
        try { localStorage.setItem(LS_KEY_AUTH, "true"); } catch {}
        onLogin();
      } else {
        setError("Usuario o contraseña incorrectos");
        setLoading(false);
      }
    }, 600);
  };

  const handleKey = e => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{
      minHeight:"100vh", background:"#0b0b18",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans',sans-serif", padding:20
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .login-input{background:#0e0e1c;border:1px solid #252545;border-radius:10px;color:#e2e8f0;font-family:'DM Sans',sans-serif;font-size:14px;padding:12px 14px;outline:none;width:100%;transition:border-color .2s;}
        .login-input:focus{border-color:#94a3b8!important;box-shadow:0 0 0 3px rgba(148,163,184,.08)!important;}
        .login-btn{cursor:pointer;border:none;outline:none;font-family:'DM Sans',sans-serif;transition:all .18s ease;}
        .login-btn:hover{opacity:.87;transform:translateY(-1px);}
        .login-btn:active{transform:translateY(0);}
      `}</style>

      <div style={{
        width:"100%", maxWidth:400,
        animation:"fadeUp .4s ease"
      }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{
            width:64, height:64, borderRadius:18,
            background:"linear-gradient(135deg,#334155,#475569)",
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            fontSize:30, boxShadow:"0 8px 32px rgba(0,0,0,.5)",
            marginBottom:16
          }}>🚢</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#f8fafc", letterSpacing:".5px" }}>
            VERVIS COMEX
          </div>
          <div style={{ fontSize:12, color:"#334155", letterSpacing:"2px", textTransform:"uppercase", marginTop:4 }}>
            Centro de Gestión
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:"#111128", border:"1px solid #1a1a38",
          borderRadius:18, padding:32
        }}>
          <div style={{ fontSize:16, fontWeight:600, color:"#e2e8f0", marginBottom:24, textAlign:"center" }}>
            Iniciá sesión para continuar
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:11, color:"#475569", textTransform:"uppercase", letterSpacing:"1.2px", display:"block", marginBottom:6 }}>Usuario</label>
              <input className="login-input" value={user}
                onChange={e=>{ setUser(e.target.value); setError(""); }}
                onKeyDown={handleKey}
                placeholder="Ingresá tu usuario"
                autoComplete="username" />
            </div>
            <div>
              <label style={{ fontSize:11, color:"#475569", textTransform:"uppercase", letterSpacing:"1.2px", display:"block", marginBottom:6 }}>Contraseña</label>
              <div style={{ position:"relative" }}>
                <input className="login-input" type={showP ? "text" : "password"}
                  value={pass}
                  onChange={e=>{ setPass(e.target.value); setError(""); }}
                  onKeyDown={handleKey}
                  placeholder="Ingresá tu contraseña"
                  autoComplete="current-password"
                  style={{ paddingRight:44 }} />
                <button className="login-btn" onClick={()=>setShowP(p=>!p)} style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", color:"#475569", fontSize:16, padding:"4px"
                }}>{showP ? "🙈" : "👁"}</button>
              </div>
            </div>

            {error && (
              <div style={{
                background:"rgba(148,163,184,.08)", border:"1px solid rgba(148,163,184,.2)",
                borderRadius:8, padding:"10px 14px",
                fontSize:13, color:"#94a3b8", textAlign:"center"
              }}>⚠️ {error}</div>
            )}

            <button className="login-btn" onClick={handleLogin} style={{
              width:"100%", padding:"13px",
              background:"linear-gradient(135deg,#334155,#475569)",
              color:"#f1f5f9", borderRadius:10,
              fontWeight:700, fontSize:15, marginTop:6,
              boxShadow:"0 4px 20px rgba(0,0,0,.4)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8
            }}>
              {loading
                ? <span style={{ display:"inline-block", animation:"pulse 1s infinite" }}>Verificando...</span>
                : "Ingresar →"
              }
            </button>
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:20, fontSize:12, color:"#1e293b" }}>
          Vervis Comex · Acceso restringido
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function VervisComex() {
  const [isAuth, setIsAuth] = useState(() => {
    try { return localStorage.getItem(LS_KEY_AUTH) === "true"; } catch { return false; }
  });
  const [tab,          setTab]          = useState("resources");
  const [resources,    setResources]    = useState(() => loadLS(LS_KEY_RES, SEED_RESOURCES));
  const [credentials,  setCredentials]  = useState(() => loadLS(LS_KEY_CRED, SEED_CREDS));
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [showAddRes,   setShowAddRes]   = useState(false);
  const [showAddCred,  setShowAddCred]  = useState(false);
  const [editingRes,   setEditingRes]   = useState(null); // resource being edited
  const [classifying,  setClassifying]  = useState(null);
  const [suggestion,   setSuggestion]   = useState(null);
  const [toast,        setToast]        = useState(null);

  // new resource form
  const [nr, setNr] = useState({
    name:"", type:"link", category:"Otro", description:"",
    hasCredentials: null, // null=not asked, false=no, true=yes
    linkUser:"", linkPass:""
  });
  // new credential form
  const [nc, setNc] = useState({ service:"", username:"", password:"", icon:"🔑" });

  // persist on change
  useEffect(() => saveLS(LS_KEY_RES,  resources),   [resources]);
  useEffect(() => saveLS(LS_KEY_CRED, credentials), [credentials]);

  const showToast = useCallback((message, type="success") => setToast({ message, type }), []);

  // ── filtered list ──
  const filtered = resources.filter(r => {
    const s = r.name.toLowerCase().includes(search.toLowerCase());
    const c = filterCat    === "Todas"  || r.category === filterCat;
    const t = filterStatus === "Todos"  || r.status   === filterStatus;
    return s && c && t;
  });

  // ── stats ──
  const stats = {
    total:       resources.length,
    clasificado: resources.filter(r=>r.status==="clasificado").length,
    pendiente:   resources.filter(r=>r.status==="pendiente").length,
    revisar:     resources.filter(r=>r.status==="revisar").length,
  };

  // ── add resource ──
  const handleAddResource = () => {
    if (!nr.name.trim()) return showToast("El nombre es requerido", "error");
    if (nr.type === "link" && nr.hasCredentials === null)
      return showToast("Indicá si el link tiene usuario y contraseña", "warning");
    const res = {
      ...nr,
      id: Date.now(), status:"pendiente",
      createdAt: new Date().toISOString().split("T")[0],
      aiSummary: null,
      linkUser: nr.hasCredentials ? nr.linkUser : null,
      linkPass: nr.hasCredentials ? nr.linkPass : null,
    };
    setResources(p => [res, ...p]);
    setNr({ name:"", type:"link", category:"Otro", description:"", hasCredentials:null, linkUser:"", linkPass:"" });
    setShowAddRes(false);
    showToast("Recurso agregado ✓");
  };

  // ── delete resource ──
  const deleteResource = id => {
    setResources(p => p.filter(r => r.id !== id));
    showToast("Recurso eliminado");
  };

  // ── open edit modal ──
  const openEdit = (resource) => {
    setEditingRes({
      ...resource,
      hasCredentials: resource.linkUser ? true : (resource.type==="link"||resource.type==="email" ? false : null),
    });
  };

  // ── save edit ──
  const saveEdit = () => {
    if (!editingRes.name.trim()) return showToast("El nombre es requerido", "error");
    if ((editingRes.type==="link"||editingRes.type==="email") && editingRes.hasCredentials===null)
      return showToast("Indicá si el link tiene usuario y contraseña", "warning");
    setResources(p => p.map(r => r.id===editingRes.id ? {
      ...editingRes,
      linkUser: editingRes.hasCredentials ? editingRes.linkUser : null,
      linkPass: editingRes.hasCredentials ? editingRes.linkPass : null,
    } : r));
    setEditingRes(null);
    showToast("Recurso actualizado ✓");
  };

  // ── export PDF ──
  const exportPDF = () => {
    const date = new Date().toLocaleDateString("es-AR", { day:"2-digit", month:"long", year:"numeric" });
    const grouped = CATEGORIES.reduce((acc, cat) => {
      const items = resources.filter(r => r.category === cat);
      if (items.length) acc[cat] = items;
      return acc;
    }, {});

    const rows = Object.entries(grouped).map(([cat, items]) => {
      const catMeta = CAT_META[cat];
      const itemRows = items.map(r => {
        const statusLabel = STATUS_CFG[r.status]?.label || r.status;
        const url = (r.type==="link"||r.type==="email") && r.description ? r.description : "";
        return `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#e2e8f0;font-size:13px;">${TYPE_META[r.type]?.icon||"📎"} ${r.name}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">${r.type}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:12px;">${statusLabel}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#64748b;font-size:12px;">${url ? `<a href="${url}" style="color:#cbd5e1;">${url}</a>` : (r.description||"—")}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#64748b;font-size:12px;">${r.aiSummary||"—"}</td>
          </tr>`;
      }).join("");
      return `
        <tr>
          <td colspan="5" style="padding:14px 12px 8px;background:#0f172a;font-size:13px;font-weight:700;color:#cbd5e1;letter-spacing:1px;text-transform:uppercase;">
            ${catMeta?.icon||""} ${cat} <span style="font-weight:400;color:#475569;font-size:11px;">(${items.length})</span>
          </td>
        </tr>
        ${itemRows}`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Vervis Comex — Índice de Recursos</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
    body{margin:0;padding:32px;background:#0b0b18;font-family:'DM Sans',sans-serif;color:#e2e8f0;}
    .header{display:flex;align-items:center;gap:16px;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #1e293b;}
    .logo{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#334155,#475569);display:flex;align-items:center;justify-content:center;font-size:26px;}
    h1{font-size:24px;font-weight:700;margin:0;color:#f8fafc;}
    .sub{font-size:12px;color:#475569;letter-spacing:2px;text-transform:uppercase;margin-top:4px;}
    .meta{margin-left:auto;text-align:right;font-size:12px;color:#475569;}
    table{width:100%;border-collapse:collapse;margin-top:8px;}
    th{padding:10px 12px;text-align:left;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:1px;background:#111827;border-bottom:1px solid #1e293b;}
    .summary{display:flex;gap:24px;margin-bottom:28px;padding:18px 20px;background:#111128;border-radius:12px;border:1px solid #1e293b;}
    .stat{text-align:center;}
    .stat-val{font-size:24px;font-weight:700;color:#e2e8f0;}
    .stat-lbl{font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-top:2px;}
    @media print{body{background:#fff;color:#111;}th,td{color:#333!important;}h1{color:#111!important;}}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🚢</div>
    <div>
      <h1>VERVIS COMEX</h1>
      <div class="sub">Índice de Recursos — Centro de Gestión</div>
    </div>
    <div class="meta">
      <div>Generado el ${date}</div>
      <div style="margin-top:4px;">${resources.length} recursos totales</div>
    </div>
  </div>
  <div class="summary">
    <div class="stat"><div class="stat-val">${resources.length}</div><div class="stat-lbl">Total</div></div>
    <div class="stat"><div class="stat-val">${resources.filter(r=>r.status==="clasificado").length}</div><div class="stat-lbl">Clasificados</div></div>
    <div class="stat"><div class="stat-val">${resources.filter(r=>r.status==="pendiente").length}</div><div class="stat-lbl">Pendientes</div></div>
    <div class="stat"><div class="stat-val">${resources.filter(r=>r.status==="revisar").length}</div><div class="stat-lbl">A Revisar</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Nombre</th><th>Tipo</th><th>Estado</th><th>URL / Descripción</th><th>Resumen IA</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #1e293b;font-size:11px;color:#334155;text-align:center;">
    Vervis Comex · Centro de Gestión · ${date}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type:"text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `vervis-comex-recursos-${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Índice exportado ✓");
  };

  // ── classify ──
  const classifyResource = async (resource) => {
    setClassifying(resource.id);
    setSuggestion(null);
    try {
      const prompt = `Sos un asistente experto en comercio exterior argentino. Analizá el recurso y respondé SOLO con JSON válido, sin texto extra:
Nombre: "${resource.name}"
Descripción: "${resource.description || "No proporcionada"}"
Tipo: ${resource.type}
Categorías disponibles: ${CATEGORIES.join(", ")}
Formato de respuesta: {"category":"<una de las categorías>","summary":"<resumen de 1-2 líneas máximo>"}`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{ role:"user", content:prompt }]
        })
      });
      const data = await resp.json();
      const text = (data.content||[]).map(i=>i.text||"").join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setSuggestion({ resourceId:resource.id, category:parsed.category, summary:parsed.summary });
        showToast("IA clasificó el recurso ✨", "info");
      }
    } catch {
      // smart offline fallback
      const n = resource.name.toLowerCase();
      const d = (resource.description||"").toLowerCase();
      const both = n+" "+d;
      let cat = "Otro", sum = "Recurso de comercio exterior pendiente de revisión.";
      if (both.includes("afip")||both.includes("aduana")||both.includes("vuce")||both.includes("bcra")||both.includes("oficial"))
        { cat="Páginas Oficiales"; sum="Sitio oficial gubernamental para trámites de comercio exterior."; }
      else if (both.includes("curso")||both.includes("capacitaci")||both.includes("incoterm")||both.includes("aprend"))
        { cat="Cursos"; sum="Material educativo o de capacitación en comercio internacional."; }
      else if (both.includes("drive")||both.includes("carpeta")||both.includes("archivo")||both.includes("documento"))
        { cat="Drive & Archivos"; sum="Repositorio de archivos y documentos del equipo."; }
      else if (both.includes("cotizaci")||both.includes("product")||both.includes("precio")||both.includes("ficha"))
        { cat="Productos & Cotizaciones"; sum="Documentación de productos y presupuestos comerciales."; }
      else if (both.includes("contrato")||both.includes("legal")||both.includes("estatuto")||both.includes("reglamento"))
        { cat="Legal"; sum="Documento legal que puede requerir revisión jurídica."; }
      else if (both.includes("finanz")||both.includes("presupuest")||both.includes("flujo")||both.includes("ingreso"))
        { cat="Finanzas"; sum="Documento financiero con datos económicos de la empresa."; }
      else if (both.includes("mail")||both.includes("correo")||both.includes("gmail")||both.includes("email"))
        { cat="Correos"; sum="Acceso a cuenta de correo electrónico empresarial."; }
      setSuggestion({ resourceId:resource.id, category:cat, summary:sum });
      showToast("Clasificado (modo sin conexión)", "info");
    }
    setClassifying(null);
  };

  const acceptSuggestion = (resource) => {
    if (!suggestion) return;
    setResources(p => p.map(r => r.id===resource.id
      ? { ...r, category:suggestion.category, aiSummary:suggestion.summary, status:"clasificado" }
      : r
    ));
    setSuggestion(null);
    showToast("Clasificación aceptada ✓");
  };

  // ── credentials ──
  const addCredential = () => {
    if (!nc.service.trim()||!nc.username.trim()) return showToast("Servicio y usuario son requeridos","error");
    setCredentials(p => [{ ...nc, id:Date.now(), visible:false }, ...p]);
    setNc({ service:"", username:"", password:"", icon:"🔑" });
    setShowAddCred(false);
    showToast("Credencial guardada ✓");
  };
  const toggleVis  = id => setCredentials(p => p.map(c => c.id===id ? {...c, visible:!c.visible} : c));
  const deleteCred = id => { setCredentials(p => p.filter(c => c.id!==id)); showToast("Credencial eliminada"); };
  const copy = (text, label) => { navigator.clipboard.writeText(text); showToast(`${label} copiado al portapapeles`); };

  // ── open link ──
  const openLink = (url) => {
    if (!url) return;
    const href = url.startsWith("http") ? url : `https://${url}`;
    window.open(href, "_blank", "noopener");
  };

  // ── input style ──
  const inputSt = {
    background:"#0e0e1c", border:"1px solid #252545",
    borderRadius:10, color:"#e2e8f0",
    fontFamily:"'DM Sans',sans-serif", fontSize:14,
    padding:"10px 14px", outline:"none", width:"100%",
    transition:"border-color .2s"
  };
  const labelSt = { fontSize:11, color:"#475569", textTransform:"uppercase", letterSpacing:"1.2px", display:"block", marginBottom:6 };

  return (
    <>
      {!isAuth && <LoginScreen onLogin={()=>setIsAuth(true)} />}
      {isAuth && (<>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Syne:wght@600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0b0b18;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:#0b0b18;}
        ::-webkit-scrollbar-thumb{background:#252545;border-radius:3px;}
        @keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .card{transition:transform .2s,border-color .2s,box-shadow .2s;}
        .card:hover{transform:translateY(-2px);border-color:#94a3b844!important;box-shadow:0 8px 32px rgba(148,163,184,.1)!important;}
        .btn{cursor:pointer;border:none;outline:none;font-family:'DM Sans',sans-serif;transition:all .18s ease;}
        .btn:hover{opacity:.87;transform:translateY(-1px);}
        .btn:active{transform:translateY(0);}
        .tab-btn{cursor:pointer;border:none;outline:none;font-family:'DM Sans',sans-serif;transition:all .2s;}
        input:focus,select:focus{border-color:#94a3b8!important;box-shadow:0 0 0 3px rgba(148,163,184,.08)!important;}
        .glow{animation:pulse 2.5s infinite;}
      `}</style>

      <div style={{ minHeight:"100vh", background:"#0b0b18", fontFamily:"'DM Sans',sans-serif", color:"#e2e8f0" }}>

        {/* ── HEADER ── */}
        <header style={{ background:"linear-gradient(180deg,#111128 0%,#0b0b18 100%)", borderBottom:"1px solid #1a1a38" }}>
          <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0", flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                {/* Logo */}
                <div style={{
                  width:48, height:48, borderRadius:14,
                  background:"linear-gradient(135deg,#334155,#475569)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:24, boxShadow:"0 4px 20px rgba(0,0,0,0.5)", flexShrink:0
                }}>🚢</div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, letterSpacing:".5px", color:"#f8fafc", lineHeight:1.1 }}>
                    {APP_NAME}
                  </div>
                  <div style={{ fontSize:11, color:"#334155", letterSpacing:"2px", textTransform:"uppercase", marginTop:2 }}>
                    {APP_SUB}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span className="glow" style={{ width:8, height:8, borderRadius:"50%", background:"#94a3b8", display:"inline-block", boxShadow:"0 0 8px #94a3b8" }} />
                  <span style={{ fontSize:12, color:"#475569" }}>Sistema activo</span>
                </div>
                <div style={{ background:"#1a1a38", border:"1px solid #252545", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#64748b" }}>
                  {new Date().toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"numeric"})}
                </div>
                <button className="btn" onClick={()=>{ try { localStorage.removeItem(LS_KEY_AUTH); } catch {} setIsAuth(false); }} style={{
                  background:"rgba(148,163,184,.08)", border:"1px solid #252545",
                  color:"#475569", padding:"5px 12px", borderRadius:8, fontSize:12,
                  display:"flex", alignItems:"center", gap:5
                }}>🚪 Salir</button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:2 }}>
              {[
                { id:"resources",    label:"Recursos",     icon:"📁", count:resources.length    },
                { id:"credentials",  label:"Credenciales", icon:"🔐", count:credentials.length  },
              ].map(t => (
                <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)} style={{
                  padding:"10px 22px", borderRadius:"10px 10px 0 0",
                  background: tab===t.id ? "#0b0b18" : "transparent",
                  color:       tab===t.id ? "#e2e8f0"  : "#475569",
                  borderBottom: tab===t.id ? "2px solid #94a3b8" : "2px solid transparent",
                  fontSize:14, fontWeight:600,
                  display:"flex", alignItems:"center", gap:8
                }}>
                  {t.icon} {t.label}
                  <span style={{
                    background: tab===t.id ? "rgba(148,163,184,.15)" : "#1a1a38",
                    color:       tab===t.id ? "#cbd5e1"               : "#475569",
                    borderRadius:20, padding:"1px 8px", fontSize:11, fontWeight:700
                  }}>{t.count}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px" }}>

          {/* ══════════════════════════════════════════════════
              TAB: RECURSOS
          ══════════════════════════════════════════════════ */}
          {tab === "resources" && (
            <div style={{ animation:"fadeUp .3s ease" }}>

              {/* Stats bar */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:24 }}>
                {[
                  { label:"Total",        value:stats.total,       color:"#cbd5e1", icon:"📦" },
                  { label:"Clasificados", value:stats.clasificado, color:"#e2e8f0", icon:"✅" },
                  { label:"Pendientes",   value:stats.pendiente,   color:"#94a3b8", icon:"⏳" },
                  { label:"A Revisar",    value:stats.revisar,     color:"#64748b", icon:"🔴" },
                ].map(s => (
                  <div key={s.label} style={{
                    background:"#111128", border:`1px solid ${s.color}30`,
                    borderRadius:14, padding:"14px 16px",
                    display:"flex", alignItems:"center", gap:12
                  }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:22, fontWeight:700, color:s.color, fontFamily:"'Syne',sans-serif", lineHeight:1 }}>{s.value}</div>
                      <div style={{ fontSize:11, color:"#475569", textTransform:"uppercase", letterSpacing:"1px", marginTop:2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
                <div style={{ flex:1, minWidth:200, position:"relative" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#475569", fontSize:16 }}>🔍</span>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar recursos..."
                    style={{ ...inputSt, paddingLeft:38 }} />
                </div>
                <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
                  style={{ ...inputSt, width:"auto", cursor:"pointer" }}>
                  <option>Todas</option>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
                  style={{ ...inputSt, width:"auto", cursor:"pointer" }}>
                  <option>Todos</option>
                  {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
                <button className="btn" onClick={exportPDF} style={{
                  background:"rgba(226,232,240,.06)", border:"1px solid rgba(226,232,240,.15)",
                  color:"#94a3b8", padding:"10px 16px", borderRadius:10,
                  fontWeight:600, fontSize:14, display:"flex", alignItems:"center", gap:8, flexShrink:0
                }}>📥 Exportar</button>
                <button className="btn" onClick={()=>setShowAddRes(true)} style={{
                  background:"linear-gradient(135deg,#334155,#475569)", color:"#f1f5f9",
                  padding:"10px 20px", borderRadius:10, fontWeight:700, fontSize:14,
                  display:"flex", alignItems:"center", gap:8,
                  boxShadow:"0 4px 18px rgba(0,0,0,.4)", flexShrink:0
                }}>+ Nuevo Recurso</button>
              </div>

              {/* Category quick-filters */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
                {["Todas",...CATEGORIES].map(c => {
                  const meta = CAT_META[c];
                  const active = filterCat === c;
                  return (
                    <button key={c} className="btn" onClick={()=>setFilterCat(c)} style={{
                      padding:"5px 13px", borderRadius:20, fontSize:12, fontWeight:600,
                      border: `1px solid ${active ? "#94a3b8" : "#252545"}`,
                      background: active ? "rgba(148,163,184,.15)" : "transparent",
                      color: active ? "#e2e8f0" : "#475569",
                      display:"flex", alignItems:"center", gap:5
                    }}>
                      {meta?.icon || "🔹"} {c}
                    </button>
                  );
                })}
              </div>

              {/* Resource cards */}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {filtered.length === 0 && (
                  <div style={{ textAlign:"center", padding:"60px 20px", color:"#334155" }}>
                    <div style={{ fontSize:44, marginBottom:12 }}>📭</div>
                    <div style={{ fontSize:16 }}>No se encontraron recursos</div>
                  </div>
                )}
                {filtered.map(r => {
                  const tm       = TYPE_META[r.type]  || TYPE_META.link;
                  const cm       = CAT_META[r.category] || CAT_META["Otro"];
                  const sc       = STATUS_CFG[r.status];
                  const isSug    = suggestion?.resourceId === r.id;
                  const isClsfy  = classifying === r.id;
                  const isEmail  = r.type === "email";
                  const isLink   = r.type === "link" || isEmail;
                  return (
                    <div key={r.id} className="card" style={{
                      background:"#111128", border:"1px solid #1a1a38",
                      borderRadius:14, padding:"15px 18px"
                    }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                        {/* type icon */}
                        <div style={{
                          width:40, height:40, borderRadius:10, flexShrink:0,
                          background:`${tm.color}18`,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:18
                        }}>{tm.icon}</div>

                        <div style={{ flex:1, minWidth:180 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:5 }}>
                            <span style={{ fontWeight:700, fontSize:15, color:"#f1f5f9" }}>{r.name}</span>
                            <Tag label={r.category} color={cm.color} />
                            <Tag label={sc.label}   color={sc.color} />
                          </div>
                          {r.description && (
                            <div style={{ fontSize:13, color:"#64748b", marginBottom:4 }}>{r.description}</div>
                          )}
                          {r.aiSummary && (
                            <div style={{
                              fontSize:12, color:"#94a3b8",
                              background:"rgba(148,163,184,.07)", borderRadius:8,
                              padding:"6px 10px", marginTop:6,
                              display:"flex", alignItems:"flex-start", gap:6,
                              border:"1px solid rgba(148,163,184,.12)"
                            }}>
                              <span>✨</span><span>{r.aiSummary}</span>
                            </div>
                          )}
                          {/* link credentials */}
                          {isLink && r.linkUser && (
                            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                              <div style={{
                                background:"#0e0e1c", border:"1px solid #252545",
                                borderRadius:8, padding:"5px 10px",
                                fontSize:12, color:"#94a3b8",
                                display:"flex", alignItems:"center", gap:6
                              }}>
                                👤 <span style={{ color:"#64748b" }}>User:</span> {r.linkUser}
                                <button className="btn" onClick={()=>copy(r.linkUser,"Usuario")} style={{ background:"none", color:"#94a3b8", fontSize:13, padding:"0 2px" }}>📋</button>
                              </div>
                              {r.linkPass && (
                                <div style={{
                                  background:"#0e0e1c", border:"1px solid #252545",
                                  borderRadius:8, padding:"5px 10px",
                                  fontSize:12, color:"#94a3b8",
                                  display:"flex", alignItems:"center", gap:6
                                }}>
                                  🔑 <span style={{ color:"#64748b" }}>Pass:</span> {"•".repeat(8)}
                                  <button className="btn" onClick={()=>copy(r.linkPass,"Contraseña")} style={{ background:"none", color:"#94a3b8", fontSize:13, padding:"0 2px" }}>📋</button>
                                </div>
                              )}
                            </div>
                          )}
                          <div style={{ fontSize:11, color:"#334155", marginTop:6 }}>
                            {r.type.toUpperCase()} · {r.createdAt}
                          </div>
                        </div>

                        {/* action buttons */}
                        <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0, flexWrap:"wrap" }}>
                          {isLink && r.description && (
                            <button className="btn" onClick={()=>openLink(r.description)} style={{
                              background:"rgba(226,232,240,.06)",
                              border:"1px solid rgba(226,232,240,.15)",
                              color:"#cbd5e1",
                              padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600,
                              display:"flex", alignItems:"center", gap:6
                            }}>
                              {isEmail ? "✉️ Abrir correo" : "🔗 Abrir"}
                            </button>
                          )}
                          {!isClsfy && !isSug && (
                            <button className="btn" onClick={()=>classifyResource(r)} style={{
                              background:"rgba(148,163,184,.08)",
                              border:"1px solid rgba(148,163,184,.2)",
                              color:"#94a3b8", padding:"7px 12px",
                              borderRadius:8, fontSize:12, fontWeight:600,
                              display:"flex", alignItems:"center", gap:5
                            }}>✨ IA</button>
                          )}
                          {isClsfy && (
                            <div style={{ display:"flex", alignItems:"center", gap:6, color:"#94a3b8", fontSize:12 }}>
                              <span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>⟳</span> Analizando
                            </div>
                          )}
                          <button className="btn" onClick={()=>openEdit(r)} style={{
                            background:"rgba(226,232,240,.06)", border:"1px solid rgba(226,232,240,.12)",
                            color:"#94a3b8", padding:"7px 10px", borderRadius:8, fontSize:14
                          }} title="Editar">✏️</button>
                          <button className="btn" onClick={()=>deleteResource(r.id)} style={{
                            background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)",
                            color:"#f87171", padding:"7px 10px", borderRadius:8, fontSize:14
                          }}>🗑</button>
                        </div>
                      </div>

                      {/* AI suggestion panel */}
                      {isSug && (
                        <div style={{
                          marginTop:14, background:"rgba(148,163,184,.05)",
                          border:"1px solid rgba(148,163,184,.15)", borderRadius:12, padding:"14px 16px"
                        }}>
                          <div style={{ fontSize:13, color:"#cbd5e1", fontWeight:700, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                            🤖 Sugerencia de IA
                          </div>
                          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                            <span style={{ fontSize:13, color:"#475569" }}>Categoría sugerida:</span>
                            <Tag label={suggestion.category} color={CAT_META[suggestion.category]?.color||"#94a3b8"} />
                          </div>
                          <div style={{ fontSize:13, color:"#94a3b8", marginBottom:12 }}>
                            <span style={{ color:"#475569" }}>Resumen: </span>{suggestion.summary}
                          </div>
                          <div style={{ display:"flex", gap:8 }}>
                            <button className="btn" onClick={()=>acceptSuggestion(r)} style={{
                              background:"linear-gradient(135deg,#334155,#475569)", color:"#f1f5f9",
                              padding:"8px 18px", borderRadius:8, fontSize:13, fontWeight:700
                            }}>✓ Aceptar</button>
                            <button className="btn" onClick={()=>setSuggestion(null)} style={{
                              background:"rgba(100,116,139,.1)", border:"1px solid #252545",
                              color:"#64748b", padding:"8px 14px", borderRadius:8, fontSize:13
                            }}>Ignorar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB: CREDENCIALES
          ══════════════════════════════════════════════════ */}
          {tab === "credentials" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                <div>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#f1f5f9" }}>🔐 Credenciales</h2>
                  <p style={{ fontSize:13, color:"#475569", marginTop:4 }}>Accesos y contraseñas de los servicios de la empresa</p>
                </div>
                <button className="btn" onClick={()=>setShowAddCred(true)} style={{
                  background:"linear-gradient(135deg,#334155,#475569)", color:"#f1f5f9",
                  padding:"10px 20px", borderRadius:10, fontWeight:700, fontSize:14,
                  display:"flex", alignItems:"center", gap:8,
                  boxShadow:"0 4px 18px rgba(0,0,0,.4)"
                }}>+ Nueva Credencial</button>
              </div>

              <div style={{
                background:"rgba(148,163,184,.06)", border:"1px solid rgba(148,163,184,.15)",
                borderRadius:12, padding:"11px 16px", marginBottom:20,
                display:"flex", alignItems:"center", gap:10
              }}>
                <span>⚠️</span>
                <span style={{ fontSize:13, color:"#94a3b8" }}>Las contraseñas se guardan en tu navegador. No compartas acceso al dispositivo.</span>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
                {credentials.map(cred => (
                  <div key={cred.id} className="card" style={{
                    background:"#111128", border:"1px solid #1a1a38", borderRadius:14, padding:"18px 20px"
                  }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:"rgba(226,232,240,.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{cred.icon}</div>
                        <span style={{ fontWeight:700, fontSize:15, color:"#f1f5f9" }}>{cred.service}</span>
                      </div>
                      <button className="btn" onClick={()=>deleteCred(cred.id)} style={{
                        background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)",
                        color:"#f87171", padding:"6px 10px", borderRadius:8, fontSize:14
                      }}>🗑</button>
                    </div>

                    {/* user row */}
                    <div style={{ marginBottom:10 }}>
                      <div style={labelSt}>Usuario</div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#0e0e1c", border:"1px solid #1a1a38", borderRadius:8, padding:"8px 12px" }}>
                        <span style={{ flex:1, fontSize:13, color:"#94a3b8", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cred.username}</span>
                        <button className="btn" onClick={()=>copy(cred.username,"Usuario")} style={{ background:"none", color:"#94a3b8", fontSize:15, padding:"2px 4px" }} title="Copiar">📋</button>
                      </div>
                    </div>

                    {/* pass row */}
                    <div>
                      <div style={labelSt}>Contraseña</div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#0e0e1c", border:"1px solid #1a1a38", borderRadius:8, padding:"8px 12px" }}>
                        <span style={{ flex:1, fontSize:13, color:"#94a3b8", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {cred.visible ? cred.password : "•".repeat(Math.min(cred.password.length, 18))}
                        </span>
                        <button className="btn" onClick={()=>toggleVis(cred.id)} style={{ background:"none", color:"#64748b", fontSize:15, padding:"2px 4px" }} title={cred.visible?"Ocultar":"Mostrar"}>
                          {cred.visible ? "🙈" : "👁"}
                        </button>
                        <button className="btn" onClick={()=>copy(cred.password,"Contraseña")} style={{ background:"none", color:"#94a3b8", fontSize:15, padding:"2px 4px" }} title="Copiar">📋</button>
                      </div>
                    </div>
                  </div>
                ))}

                {credentials.length === 0 && (
                  <div style={{ textAlign:"center", padding:"60px 20px", color:"#334155", gridColumn:"1/-1" }}>
                    <div style={{ fontSize:44, marginBottom:12 }}>🔒</div>
                    <div style={{ fontSize:16 }}>No hay credenciales guardadas</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MODAL: Editar Recurso
      ══════════════════════════════════════════════════ */}
      {editingRes && (
        <Modal onClose={()=>setEditingRes(null)} title="Editar Recurso" icon="✏️">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={labelSt}>Nombre *</label>
              <input style={inputSt} value={editingRes.name}
                onChange={e=>setEditingRes(p=>({...p,name:e.target.value}))}
                placeholder="Nombre del recurso" />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={labelSt}>Tipo</label>
                <select style={{ ...inputSt, cursor:"pointer" }} value={editingRes.type}
                  onChange={e=>setEditingRes(p=>({...p, type:e.target.value,
                    hasCredentials: (e.target.value==="link"||e.target.value==="email") ? p.hasCredentials : null
                  }))}>
                  <option value="pdf">📄 PDF</option>
                  <option value="ppt">📊 PowerPoint</option>
                  <option value="link">🔗 Link / Web</option>
                  <option value="email">✉️ Correo</option>
                </select>
              </div>
              <div>
                <label style={labelSt}>Categoría</label>
                <select style={{ ...inputSt, cursor:"pointer" }} value={editingRes.category}
                  onChange={e=>setEditingRes(p=>({...p,category:e.target.value}))}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelSt}>{(editingRes.type==="link"||editingRes.type==="email") ? "URL / Dirección" : "Descripción"}</label>
              <input style={inputSt} value={editingRes.description||""}
                onChange={e=>setEditingRes(p=>({...p,description:e.target.value}))}
                placeholder={(editingRes.type==="link"||editingRes.type==="email") ? "https://..." : "Descripción breve"} />
            </div>
            <div>
              <label style={labelSt}>Estado</label>
              <select style={{ ...inputSt, cursor:"pointer" }} value={editingRes.status}
                onChange={e=>setEditingRes(p=>({...p,status:e.target.value}))}>
                {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            {/* Credentials section for links/emails */}
            {(editingRes.type==="link"||editingRes.type==="email") && (
              <div style={{
                background:"rgba(148,163,184,.05)", border:"1px solid rgba(148,163,184,.15)",
                borderRadius:12, padding:"14px 16px"
              }}>
                <p style={{ fontSize:13, color:"#cbd5e1", fontWeight:600, marginBottom:12 }}>
                  🔐 ¿Este link requiere usuario y contraseña?
                </p>
                <div style={{ display:"flex", gap:10, marginBottom: editingRes.hasCredentials===true ? 14 : 0 }}>
                  <button className="btn" onClick={()=>setEditingRes(p=>({...p,hasCredentials:true}))} style={{
                    flex:1, padding:"9px", borderRadius:9, fontSize:13, fontWeight:700,
                    background: editingRes.hasCredentials===true ? "linear-gradient(135deg,#334155,#475569)" : "rgba(148,163,184,.08)",
                    border:`1px solid ${editingRes.hasCredentials===true ? "#475569" : "#252545"}`,
                    color: editingRes.hasCredentials===true ? "#f1f5f9" : "#64748b"
                  }}>✓ Sí, tiene acceso</button>
                  <button className="btn" onClick={()=>setEditingRes(p=>({...p,hasCredentials:false,linkUser:"",linkPass:""}))} style={{
                    flex:1, padding:"9px", borderRadius:9, fontSize:13, fontWeight:700,
                    background: editingRes.hasCredentials===false ? "rgba(100,116,139,.2)" : "transparent",
                    border:`1px solid ${editingRes.hasCredentials===false ? "#475569" : "#252545"}`,
                    color: editingRes.hasCredentials===false ? "#e2e8f0" : "#475569"
                  }}>✕ No, es público</button>
                </div>
                {editingRes.hasCredentials===true && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeUp .2s ease" }}>
                    <div>
                      <label style={labelSt}>Usuario / Email</label>
                      <input style={inputSt} value={editingRes.linkUser||""}
                        onChange={e=>setEditingRes(p=>({...p,linkUser:e.target.value}))}
                        placeholder="usuario@empresa.com" />
                    </div>
                    <div>
                      <label style={labelSt}>Contraseña</label>
                      <input style={inputSt} type="password" value={editingRes.linkPass||""}
                        onChange={e=>setEditingRes(p=>({...p,linkPass:e.target.value}))}
                        placeholder="••••••••••" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn" onClick={saveEdit} style={{
                flex:1, background:"linear-gradient(135deg,#334155,#475569)", color:"#f1f5f9",
                padding:"11px", borderRadius:10, fontWeight:700, fontSize:14,
                boxShadow:"0 4px 16px rgba(0,0,0,.3)"
              }}>Guardar Cambios</button>
              <button className="btn" onClick={()=>setEditingRes(null)} style={{
                background:"#1a1a38", color:"#64748b", padding:"11px 18px", borderRadius:10, fontSize:14, border:"1px solid #252545"
              }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: Agregar Recurso
      ══════════════════════════════════════════════════ */}
      {showAddRes && (
        <Modal onClose={()=>setShowAddRes(false)} title="Nuevo Recurso" icon="📁">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={labelSt}>Nombre *</label>
              <input style={inputSt} value={nr.name} onChange={e=>setNr(p=>({...p,name:e.target.value}))} placeholder="Ej: AFIP - Consulta de aranceles" />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={labelSt}>Tipo</label>
                <select style={{ ...inputSt, cursor:"pointer" }} value={nr.type}
                  onChange={e=>{
                    const t=e.target.value;
                    setNr(p=>({...p, type:t, hasCredentials: t==="link"||t==="email" ? null : false}));
                  }}>
                  <option value="pdf">📄 PDF</option>
                  <option value="ppt">📊 PowerPoint</option>
                  <option value="link">🔗 Link / Web</option>
                  <option value="email">✉️ Correo</option>
                </select>
              </div>
              <div>
                <label style={labelSt}>Categoría</label>
                <select style={{ ...inputSt, cursor:"pointer" }} value={nr.category} onChange={e=>setNr(p=>({...p,category:e.target.value}))}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelSt}>{(nr.type==="link"||nr.type==="email") ? "URL / Dirección *" : "Descripción"}</label>
              <input style={inputSt} value={nr.description} onChange={e=>setNr(p=>({...p,description:e.target.value}))}
                placeholder={(nr.type==="link"||nr.type==="email") ? "https://..." : "Descripción breve del documento"} />
            </div>

            {/* ─── LINK: ¿tiene usuario y contraseña? ─── */}
            {(nr.type==="link"||nr.type==="email") && (
              <div style={{
                background:"rgba(14,165,233,.06)", border:"1px solid rgba(14,165,233,.2)",
                borderRadius:12, padding:"14px 16px"
              }}>
                <p style={{ fontSize:13, color:"#7dd3fc", fontWeight:600, marginBottom:12 }}>
                  🔐 ¿Este link requiere usuario y contraseña?
                </p>
                <div style={{ display:"flex", gap:10, marginBottom: nr.hasCredentials===true ? 14 : 0 }}>
                  <button className="btn" onClick={()=>setNr(p=>({...p,hasCredentials:true}))} style={{
                    flex:1, padding:"9px", borderRadius:9, fontSize:13, fontWeight:700,
                    background: nr.hasCredentials===true ? "linear-gradient(135deg,#94a3b8,#cbd5e1)" : "rgba(148,163,184,.1)",
                    border:`1px solid ${nr.hasCredentials===true ? "#94a3b8" : "rgba(14,165,233,.25)"}`,
                    color: nr.hasCredentials===true ? "#fff" : "#cbd5e1"
                  }}>✓ Sí, tiene acceso</button>
                  <button className="btn" onClick={()=>setNr(p=>({...p,hasCredentials:false,linkUser:"",linkPass:""}))} style={{
                    flex:1, padding:"9px", borderRadius:9, fontSize:13, fontWeight:700,
                    background: nr.hasCredentials===false ? "rgba(100,116,139,.25)" : "transparent",
                    border:`1px solid ${nr.hasCredentials===false ? "#475569" : "#252545"}`,
                    color: nr.hasCredentials===false ? "#e2e8f0" : "#475569"
                  }}>✕ No, es público</button>
                </div>

                {nr.hasCredentials === true && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeUp .2s ease" }}>
                    <div>
                      <label style={labelSt}>Usuario / Email</label>
                      <input style={inputSt} value={nr.linkUser} onChange={e=>setNr(p=>({...p,linkUser:e.target.value}))} placeholder="usuario@empresa.com" />
                    </div>
                    <div>
                      <label style={labelSt}>Contraseña</label>
                      <input style={inputSt} type="password" value={nr.linkPass} onChange={e=>setNr(p=>({...p,linkPass:e.target.value}))} placeholder="••••••••••" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn" onClick={handleAddResource} style={{
                flex:1, background:"linear-gradient(135deg,#94a3b8,#cbd5e1)", color:"#fff",
                padding:"11px", borderRadius:10, fontWeight:700, fontSize:14,
                boxShadow:"0 4px 16px rgba(148,163,184,.15)"
              }}>Agregar Recurso</button>
              <button className="btn" onClick={()=>setShowAddRes(false)} style={{
                background:"#1a1a38", color:"#64748b", padding:"11px 18px", borderRadius:10, fontSize:14, border:"1px solid #252545"
              }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: Agregar Credencial
      ══════════════════════════════════════════════════ */}
      {showAddCred && (
        <Modal onClose={()=>setShowAddCred(false)} title="Nueva Credencial" icon="🔐">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"60px 1fr", gap:12 }}>
              <div>
                <label style={labelSt}>Ícono</label>
                <input style={{ ...inputSt, textAlign:"center", fontSize:22 }} value={nc.icon} onChange={e=>setNc(p=>({...p,icon:e.target.value}))} />
              </div>
              <div>
                <label style={labelSt}>Servicio *</label>
                <input style={inputSt} value={nc.service} onChange={e=>setNc(p=>({...p,service:e.target.value}))} placeholder="Gmail, AFIP, Zoom, AWS…" />
              </div>
            </div>
            <div>
              <label style={labelSt}>Usuario / Email *</label>
              <input style={inputSt} value={nc.username} onChange={e=>setNc(p=>({...p,username:e.target.value}))} placeholder="usuario@verviscomex.com" />
            </div>
            <div>
              <label style={labelSt}>Contraseña</label>
              <input style={inputSt} type="password" value={nc.password} onChange={e=>setNc(p=>({...p,password:e.target.value}))} placeholder="••••••••••••" />
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn" onClick={addCredential} style={{
                flex:1, background:"linear-gradient(135deg,#94a3b8,#cbd5e1)", color:"#fff",
                padding:"11px", borderRadius:10, fontWeight:700, fontSize:14,
                boxShadow:"0 4px 16px rgba(148,163,184,.15)"
              }}>Guardar Credencial</button>
              <button className="btn" onClick={()=>setShowAddCred(false)} style={{
                background:"#1a1a38", color:"#64748b", padding:"11px 18px", borderRadius:10, fontSize:14, border:"1px solid #252545"
              }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </>)}
  );
}
