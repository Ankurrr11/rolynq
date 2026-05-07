import React, { useState, useEffect } from 'react'
import {
  Search, Mail, FileSpreadsheet, Layout, CheckCircle,
  ChevronDown, ChevronUp, ExternalLink, Send, Loader2,
  Target, ArrowUpDown, Briefcase, MapPin, TrendingUp, Brain,
  AlertCircle, BarChart3, Compass, Clock, Sparkles, X, Building2,
  Activity, Zap, Globe, MessageSquare, Hash, Settings, Info, Shield,
  ExternalLink as LinkIcon
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://rolynq.onrender.com'
const API = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#F9FAFB;--bg2:#FFFFFF;--surface:#FFFFFF;--surface2:#F3F4F6;--surface3:#E5E7EB;
  --border:rgba(0,0,0,0.06);--border2:rgba(0,0,0,0.1);--border3:rgba(0,0,0,0.2);
  --text:#111827;--text2:#374151;--text3:#4B5563;--text4:#6B7280;
  --accent:#005F4B;--accent2:#047857;--accent-bg:rgba(0,95,75,.06);--accent-bd:rgba(0,95,75,.15);
  --green:#10B981;--green-bg:rgba(16,185,129,.08);--green-bd:rgba(16,185,129,.15);
  --orange:#F59E0B;--orange-bg:rgba(245,158,11,.08);--orange-bd:rgba(245,158,11,.15);
  --red:#EF4444;--red-bg:rgba(239,68,68,.08);--red-bd:rgba(239,68,68,.15);
  --blue:#3B82F6;--blue-bg:rgba(59,130,246,.08);--blue-bd:rgba(59,130,246,.15);
  --purple:#8B5CF6;--purple-bg:rgba(139,92,246,.08);--purple-bd:rgba(139,92,246,.15);
  --font:'Inter',-apple-system,sans-serif;--mono:'JetBrains Mono',monospace;
  --r:12px;--rs:8px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --glass: rgba(255,255,255,0.7);
}
body{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.5;-webkit-font-smoothing:antialiased;letter-spacing:-0.012em;background-image: radial-gradient(var(--border) 1px, transparent 1px);background-size: 24px 24px;}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border3);border-radius:10px}
input,textarea,select{font-family:var(--font);background:var(--surface);border:1.5px solid var(--border);color:var(--text);border-radius:var(--rs);padding:9px 13px;font-size:13.5px;outline:none;transition:all .2s ease}
input:focus,textarea:focus,select:focus{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-bg);background:#fff}
textarea{resize:vertical;min-height:120px;line-height:1.6}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.fi{animation:fadeIn .4s cubic-bezier(0.16, 1, 0.3, 1) forwards}
.si{animation:slideIn .4s cubic-bezier(0.16, 1, 0.3, 1) forwards}
.sp{animation:spin .8s linear infinite}
.pulse{animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite}
.float{animation:float 3s ease-in-out infinite}
.glass{backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:var(--glass)}
.card-hover{transition:all .2s ease;border:1.5px solid var(--border)}
.card-hover:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:var(--accent-bd)}
`

function SkillGaps({ gaps }) {
  if (!gaps || gaps.length === 0) return null;
  return <div style={{ marginTop: 12, padding: '14px 16px', background: 'var(--orange-bg)', border: '1px solid var(--orange-bd)', borderRadius: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <Zap size={14} style={{ color: 'var(--orange)' }} />
      <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase' }}>Missing Skills (Resume Gaps)</h4>
    </div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {gaps.map(g => <span key={g} style={{ fontSize: 11, fontWeight: 600, color: '#9a3412', background: 'rgba(255,138,0,0.1)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(255,138,0,0.2)' }}>{g}</span>)}
    </div>
    <p style={{ fontSize: 10, color: 'var(--orange)', marginTop: 8, fontStyle: 'italic' }}>Adding these keywords to your resume could increase your score by 15-20%.</p>
  </div>
}

function Badge({ children, color = 'default', dot, icon: I, style: s = {} }) {
  const T = {
    default: { bg: 'var(--surface2)', c: 'var(--text2)', bd: 'var(--border)' },
    accent: { bg: 'var(--accent-bg)', c: 'var(--accent2)', bd: 'var(--accent-bd)' },
    green: { bg: 'var(--green-bg)', c: 'var(--green)', bd: 'var(--green-bd)' },
    orange: { bg: 'var(--orange-bg)', c: 'var(--orange)', bd: 'var(--orange-bd)' },
    red: { bg: 'var(--red-bg)', c: 'var(--red)', bd: 'var(--red-bd)' },
    blue: { bg: 'var(--blue-bg)', c: 'var(--blue)', bd: 'var(--blue-bd)' },
    purple: { bg: 'var(--purple-bg)', c: 'var(--purple)', bd: 'var(--purple-bd)' },
    cyan: { bg: 'var(--cyan-bg)', c: 'var(--cyan)', bd: 'var(--cyan-bd)' },
  }
  const t = T[color] || T.default
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: t.bg, color: t.c, border: `1px solid ${t.bd}`, borderRadius: 20, padding: '2.5px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', ...s }}>
    {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.c, boxShadow: `0 0 8px ${t.c}` }} />}
    {I && <I size={10} style={{ opacity: 0.8 }} />}
    {children}
  </span>
}

function Btn({ children, variant = 'primary', loading, icon: I, small, ...p }) {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: small ? '6px 12px' : '9px 18px', borderRadius: small ? '6px' : '8px', fontSize: small ? 11.5 : 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: loading ? 'wait' : p.disabled ? 'not-allowed' : 'pointer', transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)', opacity: p.disabled ? .5 : 1, border: 'none', letterSpacing: '-0.01em', userSelect: 'none' }
  const V = {
    primary: { ...base, background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)', color: '#fff', boxShadow: '0 2px 4px rgba(0,95,75,.15)' },
    secondary: { ...base, background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' },
    ghost: { ...base, background: 'transparent', color: 'var(--text2)' },
    soft: { ...base, background: 'var(--accent-bg)', color: 'var(--accent2)', border: '1.5px solid var(--accent-bd)' },
  }
  return <button {...p} disabled={loading || p.disabled} style={{ ...V[variant], ...p.style }} className="btn-active">
    <style>{`.btn-active:active{transform:scale(0.96)} .btn-active:hover{filter:brightness(1.05)}`}</style>
    {loading ? <Loader2 size={small ? 12 : 14} className="sp" /> : I && <I size={small ? 12 : 14} />}{children}
  </button>
}

function ScoreRing({ score, size = 48 }) {
  if (score == null) return <div style={{ width: size, height: size, borderRadius: '50%', border: '2px dashed var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text4)', fontFamily: 'var(--mono)' }}>--</div>
  const c = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--orange)' : 'var(--red)'
  const bg = score >= 75 ? 'var(--green-bg)' : score >= 50 ? 'var(--orange-bg)' : 'var(--red-bg)'
  const r = (size - 6) / 2, circ = 2 * Math.PI * r, off = circ - (score / 100) * circ
  return <div style={{ position: 'relative', width: size, height: size, filter: score >= 75 ? `drop-shadow(0 0 8px ${c}44)` : 'none' }}>
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill={bg} stroke="rgba(0,0,0,0.03)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
    </svg>
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: size > 40 ? 14 : 11, fontWeight: 700, color: c }}>{score}</div>
  </div>
}

function CBar({ label, score, icon: I, weight }) {
  const c = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--orange)' : 'var(--red)'
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
    <I size={12} style={{ color: 'var(--text4)', flexShrink: 0 }} />
    <span style={{ fontSize: 11.5, color: 'var(--text3)', width: 65, flexShrink: 0 }}>{label}</span>
    <div style={{ flex: 1, height: 4, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', background: c, borderRadius: 2, transition: 'width .6s ease-out' }} />
    </div>
    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: c, width: 22, textAlign: 'right' }}>{score}</span>
    <span style={{ fontSize: 9.5, color: 'var(--text4)', fontFamily: 'var(--mono)', width: 26 }}>{weight}%</span>
  </div>
}

function Breakdown({ breakdown: bd, rationale }) {
  if (!bd) return null
  const items = [{ k: 'role_fit', l: 'Role Fit', i: Target, w: 30 }, { k: 'skill_overlap', l: 'Skills', i: Brain, w: 25 }, { k: 'industry_alignment', l: 'Industry', i: Briefcase, w: 18 }, { k: 'growth_signal', l: 'Growth', i: TrendingUp, w: 15 }, { k: 'seniority_match', l: 'Seniority', i: ArrowUpDown, w: 12 }]
  return <div style={{ background: 'var(--surface)', borderRadius: 'var(--rs)', padding: '12px 14px', marginTop: 12, border: '1px solid var(--border)' }} className="fi">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 16px' }}>
      {items.map(x => <CBar key={x.k} label={x.l} score={bd[x.k]} icon={x.i} weight={x.w} />)}
    </div>
    {rationale && <p style={{ fontSize: 11.5, color: 'var(--text3)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>{rationale}</p>}
  </div>
}

function SkeletonCard() {
  return <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, border: '1px solid var(--border)', display: 'flex', gap: 20, opacity: 0.6 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface2)' }} />
    <div style={{ flex: 1 }}>
      <div style={{ width: '40%', height: 16, background: 'var(--surface2)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ width: '60%', height: 12, background: 'var(--surface2)', borderRadius: 4, marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ width: 80, height: 24, background: 'var(--surface2)', borderRadius: 6 }} />
        <div style={{ width: 80, height: 24, background: 'var(--surface2)', borderRadius: 6 }} />
      </div>
    </div>
  </div>
}

function SettingsView({ connectors, gmailEmail }) {
  const [tab, setTab] = useState('connectors')
  const C = [
    { name: 'SerpAPI', active: connectors.serpapi, desc: 'Powers the organic job search engine' },
    { name: 'Gmail', active: connectors.gmail, desc: `Connected to ${gmailEmail || 'your account'}`, detail: gmailEmail },
    { name: 'Sheets', active: connectors.sheets, desc: 'Automatic syncing of job leads' },
    { name: 'Notion', active: connectors.notion, desc: 'Rich database tracking for pipeline' },
    { name: 'Slack', active: connectors.slack, desc: 'Instant notifications for hot leads' },
    { name: 'Adzuna', active: connectors.adzuna, desc: 'Global job market data feed' },
    { name: 'JSearch', active: connectors.jsearch, desc: 'Deep job board indexing API' },
    { name: 'Remotive', active: connectors.remotive, desc: 'Remote-first startup job feeds', free: true },
    { name: 'Arbeitnow', active: connectors.arbeitnow, desc: 'European tech ecosystem data', free: true },
  ]

  return <div className="fi" style={{ width: '100%' }}>
    <div style={{ display: 'flex', gap: 24, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
      {['connectors', 'documentation', 'about'].map(t => (
        <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', fontSize: 15, fontWeight: tab === t ? 700 : 500, color: tab === t ? 'var(--accent)' : 'var(--text4)', cursor: 'pointer', position: 'relative', padding: '0 4px 12px', textTransform: 'capitalize' }}>
          {t} {tab === t && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'var(--accent)', borderRadius: '3px 3px 0 0' }} />}
        </button>
      ))}
    </div>

    {tab === 'connectors' ? (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {C.map(c => <div key={c.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="si card-hover">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: c.active ? 'var(--green-bg)' : 'var(--surface2)', borderRadius: 20, border: `1px solid ${c.active ? 'var(--green-bd)' : 'var(--border)'}` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.active ? 'var(--green)' : 'var(--text4)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: c.active ? 'var(--green)' : 'var(--text4)', textTransform: 'uppercase' }}>{c.active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 16 }}>{c.desc}</p>
          </div>
          <Btn small variant={c.active ? 'secondary' : 'primary'} icon={c.active ? CheckCircle : Zap}>{c.active ? 'Connected' : 'Configure'}</Btn>
        </div>)}
      </div>
    ) : tab === 'documentation' ? (
      <div className="fi" style={{ width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 24, width: '100%', alignItems: 'stretch' }}>
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column' }} className="si card-hover">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><Zap size={20} style={{ color: 'var(--orange)' }} />Quick Start</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>1</div>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>Search for roles (e.g. "Product Manager") across 15+ premium sources simultaneously.</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>2</div>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>Upload your resume to synchronize your profile. We use this for all grading tasks.</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>3</div>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>Click <b>Grade with AI</b> to get a match score and a detailed fit breakdown.</p>
              </div>
            </div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column' }} className="si card-hover">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><Brain size={20} style={{ color: 'var(--accent)' }} />Scoring Engine</h3>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 16 }}>Our 12-dimensional deterministic engine evaluates jobs based on:</p>
              <ul style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16 }}>
                <li><b>Role Fit:</b> Direct match between your experience and requirements.</li>
                <li><b>Skill Overlap:</b> Semantic matching of technical and soft skills.</li>
                <li><b>Growth Signal:</b> Company trajectory and funding data.</li>
                <li><b>Industry Context:</b> Relevance of your domain expertise.</li>
              </ul>
            </div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column' }} className="si card-hover">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><Mail size={20} style={{ color: 'var(--blue)' }} />Cold Outreach</h3>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>Use the <b>Contact</b> button to generate a personalized cold email using LLM analysis of the JD and your resume. Send directly via Gmail integration.</p>
            </div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column' }} className="si card-hover">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><FileSpreadsheet size={20} style={{ color: 'var(--green)' }} />Integrations</h3>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>Connect <b>Google Sheets</b> or <b>Notion</b> to log your applications automatically. High scores (75+) are marked as <b>Hot Leads</b> for immediate action.</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="fi">
        <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 24, padding: 48, marginBottom: 24, boxShadow: 'var(--shadow-md)', display: 'flex', gap: 40, alignItems: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: 24, background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, fontFamily: 'var(--mono)', color: '#fff', flexShrink: 0, boxShadow: '0 10px 30px rgba(0,95,75,0.2)' }}>R</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>Rolynq Platform</h2>
            <p style={{ fontSize: 16, color: 'var(--text4)', marginBottom: 24 }}>Version 2.0.4</p>
            <p style={{ fontSize: 18, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24, maxWidth: 800 }}>Rolynq is the intelligent job search engine designed for high-performance workforce management. It leverages a 12-dimensional deterministic scoring engine to grade job fits with surgical precision.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text3)', fontSize: 15 }}><Shield size={20} style={{ color: 'var(--accent)' }} />Enterprise-grade security & privacy</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text3)', fontSize: 15 }}><Brain size={20} style={{ color: 'var(--accent)' }} />LLM-powered semantic matching</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text3)', fontSize: 15 }}><Globe size={20} style={{ color: 'var(--accent)' }} />15+ Premium global sources indexed</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn variant="secondary" icon={Info} style={{ padding: '12px 24px' }} onClick={() => setTab('documentation')}>Documentation</Btn>
          <Btn variant="secondary" icon={LinkIcon} style={{ padding: '12px 24px' }}>Official Website</Btn>
        </div>
      </div>
    )}
  </div>
}

function OutreachModal({ job, defaultFrom, resumeFile, onClose, notify }) {
  const [loading, setLoading] = useState(true), [sending, setSending] = useState(false), [sent, setSent] = useState(false)
  const [to, setTo] = useState(job.recruiter_email || ''), [data, setData] = useState(null), [tab, setTab] = useState('email')
  const [copied, setCopied] = useState(false), [findingLeads, setFindingLeads] = useState(false)

  const loadData = (leadName = null) => {
    if (leadName) setFindingLeads(true)
    else setLoading(true)
    
    fetch(`${API}/email/generate`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'X-User-ID': localStorage.getItem('rolynq_user_id') }, 
      body: JSON.stringify({ job, lead_name: leadName }) 
    })
      .then(r => r.json())
      .then(d => { 
        if (d.error) throw new Error(d.error)
        if (leadName) {
          setData(prev => ({ ...prev, email: d.email || prev.email, linkedin: d.linkedin || prev.linkedin, selected_lead: d.selected_lead }))
        } else {
          setData(d)
        }
        setLoading(false)
        setFindingLeads(false)
      })
      .catch((e) => { 
        console.error(e); 
        setLoading(false); 
        setFindingLeads(false);
        notify("Failed to generate outreach: " + e.message, "err");
        if (!data) setData({ email: { subject: '', body: '' }, linkedin: { invite: '', message: '' }, leads: [] })
      })
  }

  useEffect(() => { loadData() }, [])

  const copy = (t) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const send = async () => {
    if (!to) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('to', to);
      fd.append('subject', data.email.subject);
      fd.append('body', data.email.body);
      if (resumeFile) {
        fd.append('resume', resumeFile);
      }
      await fetch(`${API}/email/send`, { method: 'POST', headers: { 'X-User-ID': localStorage.getItem('rolynq_user_id') }, body: fd });
      setSent(true)
    } catch (e) { 
      console.error(e);
      notify("Failed to send email. Check your Gmail connection in Settings.", "err");
    }
    setSending(false)
  }

  return <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: 700, boxShadow: '0 20px 50px rgba(0,0,0,.1)', maxHeight: '92vh', overflow: 'auto' }} onClick={e => e.stopPropagation()} className="fi">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-bg)', border: '1px solid var(--accent-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={20} style={{ color: 'var(--accent)' }} /></div>
          <div><h3 style={{ fontSize: 16, fontWeight: 700 }}>AI Outreach Engine</h3><p style={{ fontSize: 12, color: 'var(--text3)' }}>Lead discovery for {job.company}</p></div>
        </div>
        <button onClick={onClose} style={{ background: 'var(--surface2)', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        <div style={{ borderRight: '1px solid var(--border)', paddingRight: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', marginBottom: 12, display: 'block', textTransform: 'uppercase' }}>Discovered Leads</label>
          {loading ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text4)', fontSize: 12 }}><Loader2 size={12} className="sp" /> Scanning...</div> : 
           data?.leads?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.leads.map(lead => (
                <div key={lead.url} onClick={() => loadData(lead.name)} style={{ padding: '10px', borderRadius: 8, border: '1px solid', borderColor: data.selected_lead === lead.name ? 'var(--accent)' : 'var(--border)', background: data.selected_lead === lead.name ? 'var(--accent-bg)' : 'var(--bg)', cursor: 'pointer', transition: 'all .2s' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: data.selected_lead === lead.name ? 'var(--accent)' : 'var(--text)' }}>{lead.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text4)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lead.title}</p>
                  <a href={lead.url} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: 'var(--blue)', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>LinkedIn <ExternalLink size={10} /></a>
                </div>
              ))}
            </div>
          ) : <p style={{ fontSize: 12, color: 'var(--text4)' }}>No direct leads found via search.</p>}
        </div>

        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--surface2)', padding: 4, borderRadius: 10 }}>
            {['email', 'linkedin'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: tab === t ? 'var(--bg2)' : 'transparent', color: tab === t ? 'var(--accent)' : 'var(--text4)', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none', transition: 'all .2s' }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {loading || findingLeads ? <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={24} className="sp" style={{ color: 'var(--accent)' }} /><p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 12 }}>AI is personalizing your message...</p></div>
            : sent ? <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-bg)', border: '1px solid var(--green-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><CheckCircle size={32} style={{ color: 'var(--green)' }} /></div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>Message Sent!</h3>
              <p style={{ fontSize: 14, color: 'var(--text3)' }}>Your outreach has been delivered successfully.</p>
              <Btn onClick={onClose} style={{ marginTop: 24 }}>Close</Btn>
            </div>
              : tab === 'email' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fi">
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', marginBottom: 6, display: 'block' }}>RECIPIENT EMAIL</label><input value={to} onChange={e => setTo(e.target.value)} placeholder="recruiter@company.com" style={{ width: '100%' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', marginBottom: 6, display: 'block' }}>SUBJECT</label><input value={data?.email?.subject} onChange={e => setData({ ...data, email: { ...data.email, subject: e.target.value } })} style={{ width: '100%' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', marginBottom: 6, display: 'block' }}>BODY</label><textarea value={data?.email?.body} onChange={e => setData({ ...data, email: { ...data.email, body: e.target.value } })} style={{ width: '100%', minHeight: 200, fontSize: 13 }} /></div>
                  {resumeFile && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--green)', fontWeight: 600, background: 'var(--green-bg)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--green-bd)' }}>
                    <CheckCircle size={12} /> Resume Attached: {resumeFile.name}
                  </div>}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                    <Btn variant="ghost" onClick={() => copy(data.email.body)}>{copied ? 'Copied!' : 'Copy Body'}</Btn>
                    <Btn onClick={send} loading={sending} icon={Send}>Send via Gmail</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fi">
                  <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)', borderRadius: 12, padding: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', marginBottom: 8, display: 'block' }}>LINKEDIN CONNECTION REQUEST (300 chars)</label>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 12 }}>{data?.linkedin?.invite}</p>
                    <Btn small variant="secondary" onClick={() => copy(data.linkedin.invite)}>{copied ? 'Copied!' : 'Copy Invite'}</Btn>
                  </div>
                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 8, display: 'block' }}>FULL LINKEDIN MESSAGE</label>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{data?.linkedin?.message}</p>
                    <Btn small variant="secondary" onClick={() => copy(data.linkedin.message)}>{copied ? 'Copied!' : 'Copy Message'}</Btn>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text4)', textAlign: 'center' }}>LinkedIn messages must be sent manually via the LinkedIn platform.</p>
                </div>
              )}
        </div>
      </div>
    </div>
  </div>
}


function ScoreModal({ job, onClose, onScored }) {
  const [file, setFile] = useState(null), [scoring, setScoring] = useState(false), [err, setErr] = useState('')
  const score = async () => {
    if (!file) return setErr('Please select a resume file (.pdf or .txt)')
    setScoring(true); setErr('')
    try {
      const fd = new FormData();
      fd.append('resume', file)
      fd.append('job', JSON.stringify(job))
      const r = await fetch(`${API}/score`, { method: 'POST', body: fd })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      onScored(d.job, file)
    } catch (e) { setErr(e.message) }
    setScoring(false)
  }
  return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: 440, boxShadow: '0 24px 80px rgba(0,0,0,.5)' }} onClick={e => e.stopPropagation()} className="fi">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--accent-bg)', border: '1px solid var(--accent-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={15} style={{ color: 'var(--accent)' }} /></div>
          <div><h3 style={{ fontSize: 14, fontWeight: 600 }}>Dynamic Resume Match</h3><p style={{ fontSize: 11, color: 'var(--text3)' }}>Upload resume to score fit</p></div>
        </div>
        <button onClick={onClose} style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} style={{ color: 'var(--text3)' }} /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '32px 10px', textAlign: 'center', background: file ? 'var(--surface)' : 'transparent' }}>
          <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf,.txt" style={{ display: 'block', margin: '0 auto', fontSize: 12, color: 'var(--text3)' }} />
        </div>
        {err && <p style={{ fontSize: 12, color: 'var(--red)', textAlign: 'center' }}>{err}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={score} loading={scoring} icon={Sparkles}>Generate Score</Btn>
        </div>
      </div>
    </div>
  </div>
}

function GlobalResumeModal({ onClose, onSet }) {
  const [file, setFile] = useState(null)
  return <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={onClose}>
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: 440, boxShadow: '0 10px 25px rgba(0,0,0,.05)' }} onClick={e => e.stopPropagation()} className="fi">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--accent-bg)', border: '1px solid var(--accent-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={15} style={{ color: 'var(--accent)' }} /></div>
          <div><h3 style={{ fontSize: 14, fontWeight: 600 }}>Resume Synchronization</h3><p style={{ fontSize: 11, color: 'var(--text3)' }}>Upload once, score all jobs instantly</p></div>
        </div>
        <button onClick={onClose} style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} style={{ color: 'var(--text3)' }} /></button>
      </div>
      <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '32px 10px', textAlign: 'center', background: file ? 'var(--surface)' : 'transparent' }}>
        <input type="file" onChange={e => {
          const f = e.target.files[0];
          if (f) { onSet(f); onClose() }
        }} accept=".pdf,.txt" style={{ display: 'block', margin: '0 auto', fontSize: 12, color: 'var(--text3)' }} />
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text4)', marginTop: 12 }}>This resume will be securely used to instantly grade incoming jobs.</p>
    </div>
  </div>
}


function JobCard({ job, onScore, onEmail, onLogSheet, onNotion, onSlack, scoring, connectors }) {
  const [exp, setExp] = useState(false), [acts, setActs] = useState({})
  const ac = { apply: 'green', email: 'blue', save: 'orange', skip: 'default' }
  const recEmail = [job.description, job.title, job.company].filter(Boolean).join(' ').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0]

  return <div style={{ background: 'var(--bg2)', borderRadius: 'var(--r)', padding: '18px 20px', position: 'relative' }} className="fi card-hover">
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}><ScoreRing score={job.score} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: 'var(--text)', marginBottom: 4 }}>{job.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{job.company}</span>
              <span style={{ fontSize: 12, color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{job.location}</span>
              {job.posted && <span style={{ fontSize: 12, color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{job.posted}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {job.link && <a href={job.link} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text3)', textDecoration: 'none', transition: 'all .2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}><ExternalLink size={13} /></a>}
            <button onClick={() => setExp(!exp)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text3)', cursor: 'pointer', transition: 'all .2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>{exp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {job.source && <Badge color="default">{job.source}</Badge>}
          {job.experience_required && <Badge color="purple">{job.experience_required}</Badge>}
          {job.salary_estimate && <Badge color="green">{job.salary_estimate}</Badge>}
          {job.suggested_action && <Badge color={ac[job.suggested_action] || 'default'} dot>{job.suggested_action}</Badge>}
          {acts.sheet && <Badge color="green" dot>logged</Badge>}
          {acts.notion && <Badge color="purple" dot>tracked</Badge>}
          {acts.slack && <Badge color="cyan" dot>notified</Badge>}
        </div>

        {recEmail && <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--blue-bg)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--blue-bd)', marginBottom: 16 }}>
          <Mail size={14} style={{ color: 'var(--blue)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', flex: 1 }}>{recEmail}</span>
          <button onClick={() => { navigator.clipboard.writeText(recEmail); setActs(a => ({ ...a, copied: true })); setTimeout(() => setActs(a => ({ ...a, copied: false })), 2000) }} style={{ background: 'var(--bg2)', border: '1.5px solid var(--blue-bd)', color: 'var(--blue)', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>{acts.copied ? 'COPIED!' : 'COPY'}</button>
        </div>}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {!job.score && <Btn small variant="primary" icon={Sparkles} loading={scoring} onClick={() => onScore(job)}>Grade with AI</Btn>}
          {job.link && <a href={job.link} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}><Btn small variant="soft" icon={ExternalLink}>Apply Now</Btn></a>}
          <Btn small variant="secondary" icon={MessageSquare} onClick={() => onEmail({ ...job, recruiter_email: recEmail })} style={{ borderColor: 'var(--purple-bd)', color: 'var(--purple)' }}>AI Outreach</Btn>
          <div style={{ height: 14, width: 1, background: 'var(--border2)', margin: '0 4px' }} />
          {connectors.sheets && <button onClick={async () => { await onLogSheet(job); setActs(a => ({ ...a, sheet: true })) }} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', padding: 4, display: 'flex', opacity: .8 }} title="Log to Sheets"><FileSpreadsheet size={15} /></button>}
          {connectors.notion && <button onClick={async () => { await onNotion(job); setActs(a => ({ ...a, notion: true })) }} style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', padding: 4, display: 'flex', opacity: .8 }} title="Track in Notion"><Layout size={15} /></button>}
          {connectors.slack && <button onClick={async () => { await onSlack(job); setActs(a => ({ ...a, slack: true })) }} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', padding: 4, display: 'flex', opacity: .8 }} title="Share on Slack"><MessageSquare size={15} /></button>}
        </div>
      </div>
    </div>
    {exp && <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', marginLeft: 0 }} className="fi">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {job.score_breakdown && <Breakdown breakdown={job.score_breakdown} rationale={job.rationale} />}
          <SkillGaps gaps={job.missing_skills} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, padding: '16px', background: 'var(--bg)', borderRadius: 'var(--rs)', border: '1px solid var(--border)', maxHeight: 500, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Job Description</h4>
            <a href={job.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', fontSize: 10, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              VIEW ORIGINAL <ExternalLink size={10} />
            </a>
          </div>
          {job.description ? (
            <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ 
              __html: recEmail ? job.description.replace(/<[^>]*>/g, '').replace(
                new RegExp(recEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), 
                match => `<mark style="background:var(--blue-bg); color:var(--blue); padding:0 4px; border-radius:4px; font-weight:700">${match}</mark>`
              ) : job.description.replace(/<[^>]*>/g, '')
            }} />
          ) : 'No description available'}
        </div>
      </div>
    </div>}
  </div>
}

function StatCard({ label, value, sub, color, icon: I }) {
  return <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px 16px', flex: 1, minWidth: 120 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <p style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 600, letterSpacing: '.06em' }}>{label}</p>
      {I && <I size={14} style={{ color: color || 'var(--text4)' }} />}
    </div>
    <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', color: color || 'var(--text)', letterSpacing: '-.02em', lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ fontSize: 10.5, color: 'var(--text4)', marginTop: 4 }}>{sub}</p>}
  </div>
}

function ConnectorDot({ name, active, free }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', background: active ? 'var(--surface2)' : 'var(--surface)', borderRadius: 6, border: `1px solid ${active ? 'var(--border2)' : 'var(--border)'}`, transition: 'all .2s' }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'var(--green)' : 'var(--text4)', boxShadow: active ? '0 0 6px var(--green)' : 'none' }} />
    <span style={{ fontSize: 11, fontWeight: 500, color: active ? 'var(--text)' : 'var(--text4)' }}>{name}</span>
  </div>
}

function KanbanBoard({ jobs, onStatusChange, onEmail }) {
  const columns = [
    { key: 'interested', label: 'Interested', color: 'var(--accent)' },
    { key: 'applied', label: 'Applied', color: 'var(--blue)' },
    { key: 'interviewing', label: 'Interviewing', color: 'var(--purple)' },
    { key: 'offer', label: 'Offer', color: 'var(--green)' }
  ]

  const getColJobs = k => jobs.filter(j => (j.status || 'interested') === k)

  return <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 20, minHeight: 'calc(100vh - 200px)' }}>
    {columns.map(col => (
      <div key={col.key} style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
            {col.label}
          </h3>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text4)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 10 }}>{getColJobs(col.key).length}</span>
        </div>
        
        <div style={{ background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {getColJobs(col.key).map(j => (
            <div key={j.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, boxShadow: 'var(--shadow-sm)' }} className="card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{j.title}</h4>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-bg)', padding: '2px 6px', borderRadius: 4 }}>{j.score || '??'}</div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>{j.company}</p>
              
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => onEmail(j)} style={{ fontSize: 9, fontWeight: 700, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--purple-bd)', background: 'var(--purple-bg)', cursor: 'pointer', color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MessageSquare size={10} /> Contact
                </button>
                <div style={{ width: 1, height: 10, background: 'var(--border2)', margin: '0 2px' }} />
                {columns.filter(c => c.key !== col.key).map(c => (
                  <button key={c.key} onClick={() => onStatusChange(j.id, c.key)} style={{ fontSize: 9, fontWeight: 700, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', color: 'var(--text4)' }} onMouseOver={e => e.currentTarget.style.borderColor = c.color} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    To {c.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {getColJobs(col.key).length === 0 && <div style={{ fontSize: 11, color: 'var(--text4)', textAlign: 'center', padding: '40px 0', fontStyle: 'italic' }}>No jobs here</div>}
        </div>
      </div>
    ))}
  </div>
}

function NavItem({ icon: I, label, active, count, onClick }) {
  return <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: active ? 'var(--accent-bg)' : 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer', color: active ? 'var(--accent)' : 'var(--text3)', transition: 'all .2s ease', width: '100%', textAlign: 'left', fontWeight: active ? 700 : 500, fontSize: 13.5 }}>
    <I size={18} style={{ opacity: active ? 1 : .7 }} />
    <span style={{ flex: 1 }}>{label}</span>
    {count > 0 && <span style={{ background: active ? 'var(--accent)' : 'var(--surface3)', color: active ? '#fff' : 'var(--text3)', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, minWidth: 18, textAlign: 'center' }}>{count}</span>}
  </button>
}

function parseDaysAgo(posted) {
  if (!posted) return 0;
  const p = posted.toLowerCase().trim();
  
  if (p.includes('just') || p.includes('now') || p.includes('sec') || p.includes('min') || p.includes('hour')) return 0;
  if (p.includes('yesterday')) return 1;
  if (p.includes('today')) return 0;
  
  const mDay = p.match(/(\d+)\s*day/);
  if (mDay) return parseInt(mDay[1]);
  
  const mWeek = p.match(/(\d+)\s*week/);
  if (mWeek) return parseInt(mWeek[1]) * 7;
  
  const mMonth = p.match(/(\d+)\s*month/);
  if (mMonth) return parseInt(mMonth[1]) * 30;
  
  const mShort = p.match(/^(\d+)([dwm])$/);
  if (mShort) {
    const n = parseInt(mShort[1]);
    const u = mShort[2];
    if (u === 'd') return n;
    if (u === 'w') return n * 7;
    if (u === 'm') return n * 30;
  }

  const d = new Date(posted);
  if (!isNaN(d.getTime())) {
    const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
  }
  
  return Infinity; // If unknown, hide from "Recent" filters
}

export default function App() {
  const [userId] = useState(() => {
    let id = localStorage.getItem('rolynq_user_id')
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 11)
      localStorage.setItem('rolynq_user_id', id)
    }
    return id
  })
  const [jobs, setJobs] = useState([])
  const [query, setQuery] = useState('Entrepreneur in Residence AI startup')
  const [targetCompany, setTargetCompany] = useState('')
  const [location, setLoc] = useState('India')
  const [searching, setSearching] = useState(false)
  const [scoringAll, setScoringAll] = useState(false)
  const [scoringId, setScoringId] = useState(null)
  const [emailJob, setEmailJob] = useState(null)
  const [scoreJob, setScoreJob] = useState(null)
  const [globalResume, setGlobalResume] = useState(null)
  const [showGlobalResume, setShowGlobalResume] = useState(false)
  const [toast, setToast] = useState(null)
  const [view, setView] = useState('search')
  const [sortBy, setSort] = useState('score')
  const [filterAct, setFilter] = useState('all')
  const [filterDate, setFilterDate] = useState('anytime')
  const [filterExp, setFilterExp] = useState('all')
  const [selSrc, setSelSrc] = useState(['linkedin', 'naukri', 'wellfound', 'greenhouse', 'lever'])
  const [connectors, setConnectors] = useState({})
  const [activity, setActivity] = useState([])
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('rolynq_history') || '[]'))
  const [serverStatus, setServerStatus] = useState('checking') // checking, online, offline

  useEffect(() => {
    const checkHealth = () => {
      fetch(`${API}/health`)
        .then(r => {
          if (r.ok) setServerStatus('online')
          else setServerStatus('offline')
        })
        .catch(() => setServerStatus('offline'))
    }
    checkHealth()
    const ival = setInterval(checkHealth, 30000)

    // Initial fetch of saved jobs
    fetch(`${API}/jobs`, { headers: { 'X-User-ID': userId } })
      .then(r => r.json())
      .then(d => {
        if (d.jobs) setJobs(d.jobs);
      })
      .catch(e => console.error("Failed to fetch jobs:", e));
    
    refreshActivity();
    return () => clearInterval(ival)
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('rolynq_history', JSON.stringify(history.slice(0, 10)))
  }, [history])

  const addToHistory = (q, loc) => {
    const entry = { q, loc, time: new Date().toLocaleTimeString() }
    setHistory(prev => [entry, ...prev.filter(h => h.q !== q || h.loc !== loc)].slice(0, 10))
  }

  const allSrc = [
    { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
    { key: 'naukri', label: 'Naukri', color: '#4A90D9' },
    { key: 'wellfound', label: 'Wellfound', color: '#050505' },
    { key: 'yc', label: 'YC Startup', color: '#F26522' },
    { key: 'weekday', label: 'Weekday', color: '#000000' },
    { key: 'instahyre', label: 'Instahyre', color: '#1F2937' },
    { key: 'cutshort', label: 'Cutshort', color: '#6C5CE7' },
    { key: 'greenhouse', label: 'Greenhouse', color: '#2F764D' },
    { key: 'lever', label: 'Lever', color: '#262626' },
    { key: 'ashby', label: 'Ashby', color: '#5E48E8' },
    { key: 'indeed', label: 'Indeed', color: '#2164F3' },
    { key: 'iimjobs', label: 'IIMJobs', color: '#FF6B35' },
    { key: 'foundit', label: 'Foundit', color: '#6C5CE7' },
    { key: 'remotive', label: 'Remotive', color: '#5850EC', free: true },
    { key: 'arbeitnow', label: 'Arbeitnow', color: '#FF6B6B', free: true },
    { key: 'adzuna', label: 'Adzuna', color: '#36B37E' },
    { key: 'jsearch', label: 'JSearch', color: '#F97316' },
    { key: 'google_jobs', label: 'Google Jobs', color: '#4285F4' },
  ]

  useEffect(() => {
    fetch(`${API}/connectors/status`, { headers: { 'X-User-ID': userId } }).then(r => r.json()).then(d => {
      setConnectors(d.connectors || {})
      setGmailEmail(d.gmail_email || '')
    }).catch(() => { })
  }, [userId])

  const toggle = k => setSelSrc(p => p.includes(k) ? p.filter(s => s !== k) : [...p, k])
  const notify = (m, t = 'ok') => { setToast({ m, t }); setTimeout(() => setToast(null), 3500) }
  const refreshActivity = () => fetch(`${API}/activity`, { headers: { 'X-User-ID': userId } }).then(r => r.json()).then(d => setActivity(d.log || [])).catch(() => { })

  // REAXTIVE FILTERING LOGIC
  const { dj, scored, hot, avg } = React.useMemo(() => {
    let filtered = [...jobs];

    // 1. Action Filter
    if (filterAct !== 'all') {
      filtered = filtered.filter(j => j.suggested_action === filterAct);
    }

    // 2. Date Filter with Grace Period
    if (filterDate !== 'anytime') {
      filtered = filtered.filter(j => {
        const d = parseDaysAgo(j.posted);
        // Added +1 day grace period for stability
        if (filterDate === '24h') return d <= 1.5; 
        if (filterDate === '2d') return d <= 2.5; 
        if (filterDate === '3d') return d <= 4;
        if (filterDate === '1w') return d <= 8;
        if (filterDate === '2w') return d <= 15;
        if (filterDate === '1m') return d <= 32;
        if (filterDate === '3m') return d <= 95;
        return true;
      });
    }

    // 3. Experience Filter
    if (filterExp !== 'all') {
      filtered = filtered.filter(j => {
        const exp = j.experience_required?.toLowerCase() || "";
        if (exp === "not specified") return filterExp === 'entry'; // Show unspecified in Entry level
        if (filterExp === 'entry') return exp.includes('0-') || exp.includes('1-') || exp.includes('2-') || exp.includes('entry') || exp.includes('fresher');
        if (filterExp === 'mid') return exp.includes('3-') || exp.includes('4-') || exp.includes('5-') || exp.includes('6-');
        if (filterExp === 'senior') return exp.includes('7-') || exp.includes('8-') || exp.includes('9-') || exp.includes('10-') || exp.includes('+');
        return true;
      });
    }

    const scoredJobs = filtered.filter(j => j.score != null);
    const avgScore = scoredJobs.length ? Math.round(scoredJobs.reduce((s, j) => s + j.score, 0) / scoredJobs.length) : 0;
    const hotLeads = scoredJobs.filter(j => j.score >= 75).length;

    return {
      dj: filtered,
      scored: scoredJobs,
      hot: hotLeads,
      avg: avgScore
    };
  }, [jobs, filterAct, filterDate, filterExp]);

  const doSearch = async (hEntry = null) => {
    const sQuery = hEntry ? hEntry.q : query
    const sLoc = hEntry ? hEntry.loc : location
    const sComp = hEntry ? "" : targetCompany
    
    if (hEntry) { setQuery(hEntry.q); setLoc(hEntry.loc); setTargetCompany("") }
    setSearching(true)
    if (!hEntry) addToHistory(sQuery, sLoc)

    try {
      const r = await fetch(`${API}/search`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-User-ID': userId }, 
        body: JSON.stringify({ query: sQuery, company: sComp, location: sLoc, sources: selSrc }) 
      })
      const d = await r.json(); if (d.error) throw new Error(d.error)
      const newJobs = d.jobs || [];
      setJobs(newJobs)
      
      const errCount = Object.keys(d.errors || {}).length
      notify(`Found ${d.count} jobs (${newJobs.length} match filters)${errCount ? ` - ${errCount} source errors` : ''}`)
      if (!globalResume) setShowGlobalResume(true)
      refreshActivity()
    } catch (e) { notify(e.message, 'err') }
    setSearching(false)
  }

  const doScore = async job => {
    if (!globalResume) return setScoreJob(job)
    setScoringId(job.id)
    try {
      const fd = new FormData()
      fd.append('resume', globalResume)
      fd.append('job', JSON.stringify(job))
      const r = await fetch(`${API}/score`, { method: 'POST', headers: { 'X-User-ID': userId }, body: fd })
      const d = await r.json(); if (d.error) throw new Error(d.error)
      setJobs(p => p.map(j => j.id === job.id ? d.job : j))
      notify('Dynamically graded against your resume!')
      refreshActivity()
    } catch (e) { notify(e.message, 'err') }
    setScoringId(null)
  }

  const doScoreAll = async () => { setScoringAll(true); for (const j of dj.filter(j => j.score == null)) await doScore(j); setScoringAll(false); notify('All jobs scored!'); refreshActivity() }
  const doSheet = async j => { try { await fetch(`${API}/sheets/log`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-User-ID': userId }, body: JSON.stringify({ job_id: j.id, job: j }) }); notify('Logged to Google Sheets'); refreshActivity() } catch (e) { notify(e.message, 'err') } }
  const doNotion = async j => { try { await fetch(`${API}/notion/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-User-ID': userId }, body: JSON.stringify({ job_id: j.id, job: j }) }); notify('Notion card created'); refreshActivity() } catch (e) { notify(e.message, 'err') } }
  const doSlack = async j => { try { await fetch(`${API}/slack/notify`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-User-ID': userId }, body: JSON.stringify({ job_id: j.id, job: j }) }); notify('Slack notification sent'); refreshActivity() } catch (e) { notify(e.message, 'err') } }
  const doLogAll = async () => { try { const r = await fetch(`${API}/sheets/log-all`, { method: 'POST', headers: { 'X-User-ID': userId } }); const d = await r.json(); notify(`Logged ${d.logged} jobs to Sheets`); refreshActivity() } catch (e) { notify(e.message, 'err') } }


  // DYNAMIC LIST CALCULATION
  const sortedDj = [...dj];
  sortedDj.sort((a,b)=>sortBy==='score'?(b.score||-1)-(a.score||-1):(a.company||'').localeCompare(b.company||''));
  
  const vj = view==='hot' ? sortedDj.filter(j=>j.score>=75) : 
             view==='pipeline' ? sortedDj.filter(j=>j.score!=null) : 
             sortedDj;

  // Console log for debugging the dynamic updates
  useEffect(() => {
    console.log(`[UI UPDATE] Filter: ${filterDate}, List Size: ${vj.length}`);
  }, [filterDate, vj.length]);

  const QS = ['Entrepreneur in Residence AI startup', 'Chief of Staff startup', 'Product Manager B2B SaaS', 'Growth Manager startup', 'Strategy Operations', 'VC Analyst']

  return <>
    <style>{CSS}</style>

    {toast && <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 2000, background: toast.t === 'err' ? 'var(--red-bg)' : 'var(--green-bg)', color: toast.t === 'err' ? 'var(--red)' : 'var(--green)', border: `1px solid ${toast.t === 'err' ? 'var(--red-bd)' : 'var(--green-bd)'}`, borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,.3)', backdropFilter: 'blur(8px)' }} className="fi">
      {toast.t === 'err' ? <AlertCircle size={13} /> : <CheckCircle size={13} />}{toast.m}
    </div>}

    {emailJob && <OutreachModal job={emailJob} defaultFrom={gmailEmail} resumeFile={globalResume} onClose={() => setEmailJob(null)} notify={notify} />}
    {showGlobalResume && <GlobalResumeModal onClose={() => setShowGlobalResume(false)} onSet={f => setGlobalResume(f)} />}
    {scoreJob && <ScoreModal job={scoreJob} onClose={() => setScoreJob(null)} onScored={(j, f) => {
      if (f) setGlobalResume(f)
      setJobs(p => p.map(x => x.id === j.id ? j : x))
      setScoreJob(null)
      notify('Dynamically graded against your resume!')
      refreshActivity()
    }} />}


    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'var(--bg2)', borderRight: '1.5px solid var(--border)', padding: '24px 16px', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden' }} className="glass">
        <div style={{ marginBottom: 32, padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, fontFamily: 'var(--mono)', color: '#fff', boxShadow: '0 4px 12px rgba(0,95,75,0.2)' }}>R</div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)' }}>Rolynq</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 500, letterSpacing: '0.01em' }}>Job Search Intelligence</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
          <NavItem icon={Search} label="Search" active={view === 'search'} onClick={() => setView('search')} />
          <NavItem icon={Layout} label="Board" active={view === 'board'} onClick={() => setView('board')} />
          <NavItem icon={BarChart3} label="Pipeline" active={view === 'pipeline'} onClick={() => setView('pipeline')} count={scored.length} />
          <NavItem icon={Zap} label="Hot Leads" active={view === 'hot'} onClick={() => setView('hot')} count={hot} />
          <NavItem icon={Activity} label="Activity" active={view === 'activity'} onClick={() => { setView('activity'); refreshActivity() }} />
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />
        <p style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 700, letterSpacing: '.1em', padding: '0 12px', marginBottom: 10, textTransform: 'uppercase' }}>Sources</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0 4px', marginBottom: 12 }}>
          {allSrc.map(s => {
            const on = selSrc.includes(s.key)
            return <button key={s.key} onClick={() => toggle(s.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: on ? 'var(--accent-bg)' : 'transparent', border: on ? '1px solid var(--accent-bd)' : '1px solid transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: on ? 600 : 500, color: on ? 'var(--accent)' : 'var(--text3)', width: '100%', textAlign: 'left', transition: 'all .2s' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${on ? s.color : 'var(--border3)'}`, background: on ? s.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s', boxShadow: on ? `0 0 8px ${s.color}33` : 'none' }}>
                {on && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>}
              </div>
              {s.label}
            </button>
          })}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ borderTop: '1px solid var(--border)', margin: '0 0 14px' }} />
          <NavItem icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
        </div>

        {history.length > 0 && <div style={{ marginTop: 20 }}>
          <h4 style={{ fontSize: 10, fontWeight: 800, color: 'var(--text4)', padding: '0 12px 10px', textTransform: 'uppercase', letterSpacing: '.1em' }}>History</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {history.map((h, i) => (
              <button key={i} onClick={() => doSearch(h)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text3)', fontSize: 12, textAlign: 'left', transition: 'all .2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <Clock size={14} style={{ opacity: .6 }} />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.q}</span>
              </button>
            ))}
          </div>
        </div>}

        <div style={{ marginTop: 'auto', padding: '16px 12px 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: serverStatus === 'online' ? '#10b981' : serverStatus === 'offline' ? '#ef4444' : '#f59e0b', boxShadow: serverStatus === 'online' ? '0 0 10px rgba(16,185,129,0.4)' : 'none', transition: 'all .3s' }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {serverStatus === 'online' ? 'Backend Live' : serverStatus === 'offline' ? 'Backend Sleeping' : 'Connecting...'}
          </span>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px 40px', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {view === 'settings' ? (
          <div style={{ width: '100%', maxWidth: '100%' }} className="fi">
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 4 }}>Settings</h1>
            <p style={{ fontSize: 15, color: 'var(--text4)', marginBottom: 32 }}>Configure your integrations and view platform details</p>
            <SettingsView connectors={connectors} gmailEmail={gmailEmail} />
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 1200 }}>
            {view === 'search' && <div style={{ marginBottom: 32 }} className="fi">
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Discover Jobs</h1>
              <p style={{ fontSize: 14, color: 'var(--text4)' }}>AI-powered career matching engine</p>
            </div>}

            {view === 'board' && <div style={{ marginBottom: 32 }} className="fi">
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Job Board</h1>
              <p style={{ fontSize: 14, color: 'var(--text4)' }}>Manage your application pipeline</p>
            </div>}

            {view === 'activity' && <div style={{ marginBottom: 32 }} className="fi">
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Activity</h1>
              <p style={{ fontSize: 14, color: 'var(--text4)' }}>Recent actions and platform updates</p>
            </div>}

            {['search', 'pipeline', 'hot', 'board'].includes(view) && jobs.length > 0 && <div style={{ display: 'flex', gap: 16, marginBottom: 24 }} className="fi">
              <StatCard label="TOTAL JOBS" value={dj.length} sub={<>
                {jobs.length > dj.length ? (
                  <button onClick={() => {setFilterDate('anytime'); setFilterExp('all');}} style={{ background: 'none', border: 'none', color: 'var(--accent)', padding: 0, fontSize: 10, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                    {jobs.length - dj.length} hidden (Show all {jobs.length})
                  </button>
                ) : `${jobs.length} total found`}
              </>} icon={Hash} />
              <StatCard label="AI GRADED" value={scored.length} color="var(--accent)" sub={`${Math.round(scored.length / Math.max(dj.length, 1) * 100)}% done`} icon={Sparkles} />
              <StatCard label="MATCH RATE" value={avg ? `${avg}%` : '--'} color={avg >= 60 ? 'var(--green)' : 'var(--orange)'} sub="avg compatibility" icon={Target} />
              <StatCard label="HOT LEADS" value={hot} color="var(--green)" sub="score >= 75" icon={Zap} />
            </div>}

            {view === 'search' && <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 2, position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
                  <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder="Role (e.g. Program Manager)" style={{ width: '100%', paddingLeft: 42, fontSize: 15, height: 48, borderRadius: 12, background: 'var(--bg1)', border: '1.5px solid var(--border)', color: 'var(--text1)' }} />
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Building2 size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
                  <input value={targetCompany} onChange={e => setTargetCompany(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder="Organization" style={{ width: '100%', paddingLeft: 42, fontSize: 15, height: 48, borderRadius: 12, background: 'var(--bg1)', border: '1.5px solid var(--border)', color: 'var(--text1)' }} />
                </div>
                <Btn onClick={doSearch} loading={searching} icon={Search} style={{ height: 48, padding: '0 32px' }}>Search</Btn>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={location} onChange={e => setLoc(e.target.value)} style={{ width: 180, height: 40, borderRadius: 10, fontSize: 13 }}>
                  <option value="India">India (All)</option>
                  <option value="Worldwide">Worldwide</option>
                  <option value="Gurugram/Gurgaon">Gurugram/Gurgaon</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Noida">Noida</option>
                  <option value="Pune">Pune</option>
                </select>
                <select value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 140, height: 40, borderRadius: 10, fontSize: 13 }}>
                  <option value="anytime">Anytime</option>
                  <option value="24h">24 Hours</option>
                  <option value="2d">Past 2 Days</option>
                  <option value="3d">Past 3 Days</option>
                  <option value="1w">Past 1 Week</option>
                  <option value="2w">Past 2 Weeks</option>
                  <option value="1m">Past 1 Month</option>
                  <option value="3m">Past 3 Months</option>
                </select>
                <select value={filterExp} onChange={e => setFilterExp(e.target.value)} style={{ width: 130, height: 40, borderRadius: 10, fontSize: 13 }}>
                  <option value="all">Experience</option>
                  <option value="entry">Entry (0-2Y)</option>
                  <option value="mid">Mid (3-6Y)</option>
                  <option value="senior">Senior (7Y+)</option>
                </select>
              </div>

              {jobs.length === 0 && <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                {QS.map(q => <button key={q} onClick={() => setQuery(q)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text3)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface3)'} onMouseOut={e => e.currentTarget.style.background = 'var(--surface2)'}>{q}</button>)}
              </div>}
            </div>}

            {jobs.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', background: 'var(--accent-bg)', border: '1px solid var(--accent-bd)', borderRadius: 12 }} className="fi">
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Bulk AI Analysis</h4>
                <p style={{ fontSize: 11, color: 'var(--text4)' }}>Grade all {dj.filter(j => j.score == null).length} new jobs against your resume in one click.</p>
              </div>
              <Btn variant="primary" icon={Sparkles} onClick={doScoreAll} loading={scoringAll}>Grade All Matches</Btn>
              {connectors.sheets && <Btn variant="secondary" icon={FileSpreadsheet} onClick={doLogAll}>Sync to Sheets</Btn>}
            </div>}

            {['search', 'pipeline', 'hot'].includes(view) && jobs.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={filterAct} onChange={e => setFilter(e.target.value)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                  <option value="all">Filter: All Actions</option><option value="apply">Apply</option><option value="email">Email</option><option value="save">Save</option><option value="skip">Skip</option>
                </select>
                <select value={sortBy} onChange={e => setSort(e.target.value)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                  <option value="score">Sort by AI Score</option><option value="company">Sort by Company</option>
                </select>
              </div>
            </div>}

            {view === 'search' && jobs.length === 0 && !searching && <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--bg2)', borderRadius: 24, border: '1.5px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div className="float" style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--accent-bg)', border: '1.5px solid var(--accent-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Compass size={36} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em' }}>Ready for your next move?</h2>
              <p style={{ fontSize: 15, color: 'var(--text4)', marginBottom: 0, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>Enter a role or select a quick-start keyword above to discover curated jobs from over 15+ premium sources.</p>
            </div>}

            {searching && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>}

            {['search', 'pipeline', 'hot'].includes(view) && !searching && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {vj.map((j, i) => <div key={j.id || i} className="fi" style={{ animationDelay: `${i * 0.05}s` }}>
                <JobCard job={j} onScore={doScore} scoring={scoringId === j.id} onEmail={setEmailJob} onLogSheet={doSheet} onNotion={doNotion} onSlack={doSlack} connectors={connectors} />
              </div>)}

              {jobs.length > dj.length && view === 'search' && (
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--surface2)', borderRadius: 12, border: '1px dashed var(--border)', marginTop: 12 }} className="fi">
                  <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>+ {jobs.length - dj.length} jobs are hidden by your <b>{filterExp !== 'all' ? 'Experience' : 'Time'}</b> filter</p>
                  <Btn small variant="soft" onClick={() => { setFilterDate('anytime'); setFilterExp('all'); }}>Clear Filters</Btn>
                </div>
              )}
            </div>}

            {view === 'board' && <KanbanBoard jobs={jobs} onEmail={setEmailJob} onStatusChange={async (id, s) => {
              try {
                await fetch(`${API}/job/status`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-User-ID': userId }, body: JSON.stringify({ id, status: s }) });
                setJobs(p => p.map(j => j.id === id ? { ...j, status: s } : j));
                notify(`Moved to ${s}`);
                refreshActivity();
              } catch (e) { notify(e.message, 'err') }
            }} />}

            {view === 'activity' && (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 16, boxShadow: 'var(--shadow)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={16} style={{ color: 'var(--accent)' }} />Activity Log</h3>
                {activity.length === 0 ? <p style={{ fontSize: 13, color: 'var(--text4)', textAlign: 'center', padding: 48 }}>No activity yet. Explore and interact with jobs!</p>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activity.map((a, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', transition: 'all .2s' }} className="si card-hover">
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text4)', flexShrink: 0 }}>{a.time}</span>
                      <Badge color={a.action === 'search' ? 'accent' : a.action === 'scored' ? 'orange' : a.action === 'emailed' ? 'blue' : a.action === 'sheet_logged' ? 'green' : a.action === 'notion_created' ? 'purple' : 'default'}>{a.action}</Badge>
                      <span style={{ fontSize: 13, color: 'var(--text2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{a.job_title}{a.company ? ` @ ${a.company}` : ''}</span>
                      {a.detail && <span style={{ fontSize: 11, color: 'var(--text4)', flexShrink: 0 }}>{a.detail}</span>}
                    </div>)}
                  </div>}
              </div>
            )}

            {view === 'hot' && jobs.length > 0 && vj.length === 0 && <div style={{ textAlign: 'center', padding: 64, color: 'var(--text4)' }}><Zap size={32} style={{ marginBottom: 12, opacity: .3 }} className="float" /><p style={{ fontSize: 14, fontWeight: 500 }}>No hot leads found yet. Try scoring some jobs!</p></div>}
            {view === 'pipeline' && jobs.length > 0 && vj.length === 0 && <div style={{ textAlign: 'center', padding: 64, color: 'var(--text4)' }}><BarChart3 size={32} style={{ marginBottom: 12, opacity: .3 }} className="float" /><p style={{ fontSize: 14, fontWeight: 500 }}>Your pipeline is empty. Start grading jobs to see them here.</p></div>}
          </div>
        )}
      </main>
    </div>
  </>
}
