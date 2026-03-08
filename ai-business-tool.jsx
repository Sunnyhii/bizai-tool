import { useState, useEffect, useRef } from "react";

const TOOLS = [
  {
    id: "email",
    icon: "✉️",
    label: "Email Writer",
    description: "Write professional emails in seconds",
    color: "#00E5A0",
    placeholder: "Describe the email you need (e.g. 'Follow up email to client who hasn't paid invoice for 30 days')",
    systemPrompt: `You are an expert business email writer for small businesses. Write concise, professional, and effective emails. 
Format: Subject line first (bold), then the email body. Keep it short, direct, and action-oriented. 
Use a warm but professional tone. Always include a clear call to action.`,
  },
  {
    id: "reply",
    icon: "💬",
    label: "Customer Reply",
    description: "Respond to customer messages instantly",
    color: "#FF6B6B",
    placeholder: "Paste a customer message or complaint here...",
    systemPrompt: `You are a customer service expert for small businesses. Write empathetic, professional, and solution-focused replies to customer messages.
Be warm, acknowledge their concern, offer a clear solution or next step. Keep it concise (3-5 sentences max). 
Never be defensive. Always end on a positive note.`,
  },
  {
    id: "invoice",
    icon: "📄",
    label: "Invoice Description",
    description: "Generate professional service descriptions",
    color: "#FFD93D",
    placeholder: "Describe the work done (e.g. 'Built a 5-page website with contact form for a bakery')",
    systemPrompt: `You are a professional invoice writer for small businesses. Create clear, professional line-item descriptions for invoices.
Format as 2-3 professional line items with descriptions. Be specific and value-focused. 
Use formal business language. Include suggested pricing tiers if helpful.`,
  },
  {
    id: "social",
    icon: "📱",
    label: "Social Post",
    description: "Create engaging posts for any platform",
    color: "#A78BFA",
    placeholder: "What's the post about? Include platform (Instagram, Facebook, LinkedIn...) and topic",
    systemPrompt: `You are a social media expert for small businesses. Create engaging, authentic social media posts.
Include relevant emojis, a strong hook in the first line, value in the body, and a clear CTA. 
Add 5-8 relevant hashtags at the end. Match the tone to the platform specified.`,
  },
  {
    id: "proposal",
    icon: "📋",
    label: "Business Proposal",
    description: "Write winning client proposals fast",
    color: "#38BDF8",
    placeholder: "Describe your service/product and the client's problem you're solving...",
    systemPrompt: `You are a business proposal writer for small businesses. Write compelling, concise proposals that win clients.
Structure: Problem → Solution → Value → Investment → Next Steps. 
Keep it under 300 words. Be specific about outcomes and ROI. Sound confident and professional.`,
  },
  {
    id: "bio",
    icon: "👤",
    label: "Business Bio",
    description: "Craft your perfect brand story",
    color: "#FB923C",
    placeholder: "Tell me about your business — what you do, who you serve, how long you've been operating...",
    systemPrompt: `You are a brand copywriter specializing in small business bios. Write compelling, authentic business bios.
Create 3 versions: Short (1 sentence), Medium (2-3 sentences), Full (1 paragraph). 
Focus on value delivered to customers, not just what you do. Make it memorable and human.`,
  },
];

export default function AIBusinessTool() {
  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [history, setHistory] = useState([]);
  const outputRef = useRef(null);

  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  useEffect(() => {
    setInput("");
    setOutput("");
    setCopied(false);
  }, [activeTool]);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setCopied(false);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {   "Content-Type": "application/json",   "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,   "anthropic-version": "2023-06-01",   "anthropic-dangerous-direct-browser-calls": "true", },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: activeTool.systemPrompt,
          messages: [{ role: "user", content: input }],
        }),
      });

      const data = await response.json();
      const result = data.content?.map(b => b.text || "").join("") || "Something went wrong. Please try again.";
      setOutput(result);
      setHistory(prev => [{ tool: activeTool.label, input: input.slice(0, 60) + "...", output: result }, ...prev.slice(0, 4)]);
    } catch {
      setOutput("⚠️ Error connecting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      color: "#F0F0F5",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      padding: "0",
      overflow: "hidden",
    }}>
      {/* Ambient BG */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,229,160,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(167,139,250,0.06) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)",
            borderRadius: 100, padding: "6px 18px", marginBottom: 20,
            fontSize: 12, color: "#00E5A0", letterSpacing: "0.15em", textTransform: "uppercase",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E5A0", display: "inline-block", animation: "pulse 2s infinite" }} />
            AI-Powered · Ready to Use
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            background: "linear-gradient(135deg, #ffffff 0%, #00E5A0 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
          }}>BizAI Assistant</h1>
          <p style={{ color: "#888", fontSize: 16, margin: 0 }}>
            6 AI tools that save small businesses <strong style={{ color: "#00E5A0" }}>hours every week</strong>
          </p>
        </div>

        {/* Tool Selector */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10, marginBottom: 28,
        }}>
          {TOOLS.map(tool => (
            <button key={tool.id} onClick={() => setActiveTool(tool)} style={{
              background: activeTool.id === tool.id
                ? `linear-gradient(135deg, ${tool.color}22, ${tool.color}11)`
                : "rgba(255,255,255,0.03)",
              border: activeTool.id === tool.id
                ? `1.5px solid ${tool.color}66`
                : "1.5px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "14px 10px",
              cursor: "pointer", transition: "all 0.2s",
              textAlign: "center",
              transform: activeTool.id === tool.id ? "translateY(-2px)" : "none",
              boxShadow: activeTool.id === tool.id ? `0 8px 30px ${tool.color}22` : "none",
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{tool.icon}</div>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: activeTool.id === tool.id ? tool.color : "#ccc",
                letterSpacing: "0.03em",
              }}>{tool.label}</div>
            </button>
          ))}
        </div>

        {/* Main Panel */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20, padding: 20,
        }}>
          {/* Input */}
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 10,
            }}>
              <label style={{ fontSize: 12, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {activeTool.icon} Your Input
              </label>
              <span style={{ fontSize: 11, color: charCount > 400 ? "#FF6B6B" : "#555" }}>{charCount}/500</span>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 500))}
              placeholder={activeTool.placeholder}
              maxLength={500}
              rows={8}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 12, padding: "14px",
                color: "#F0F0F5", fontSize: 14, lineHeight: 1.6,
                resize: "vertical", outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = activeTool.color + "99"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button
              onClick={generate}
              disabled={loading || !input.trim()}
              style={{
                marginTop: 12, width: "100%",
                background: loading || !input.trim()
                  ? "rgba(255,255,255,0.05)"
                  : `linear-gradient(135deg, ${activeTool.color}, ${activeTool.color}bb)`,
                border: "none", borderRadius: 10,
                padding: "14px", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                color: loading || !input.trim() ? "#555" : "#000",
                fontWeight: 800, fontSize: 14, letterSpacing: "0.05em",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {loading ? "⏳ Generating..." : `✨ Generate ${activeTool.label}`}
            </button>
          </div>

          {/* Output */}
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 10,
            }}>
              <label style={{ fontSize: 12, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                🤖 AI Output
              </label>
              {output && (
                <button onClick={copy} style={{
                  background: copied ? "rgba(0,229,160,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${copied ? "#00E5A060" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 8, padding: "4px 12px",
                  color: copied ? "#00E5A0" : "#888",
                  fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                }}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div ref={outputRef} style={{
              minHeight: 200, maxHeight: 280,
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "14px",
              fontSize: 14, lineHeight: 1.7,
              overflowY: "auto", color: output ? "#E8E8F0" : "#444",
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
            }}>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[80, 60, 90, 50].map((w, i) => (
                    <div key={i} style={{
                      height: 12, borderRadius: 6,
                      background: `rgba(255,255,255,0.05)`,
                      width: `${w}%`,
                      animation: "shimmer 1.5s infinite",
                      animationDelay: `${i * 0.15}s`,
                    }} />
                  ))}
                </div>
              ) : output || "Your AI-generated content will appear here..."}
            </div>

            {/* Tool Description */}
            <div style={{
              marginTop: 12, padding: "10px 14px",
              background: `linear-gradient(135deg, ${activeTool.color}0A, transparent)`,
              border: `1px solid ${activeTool.color}22`,
              borderRadius: 10, fontSize: 12, color: "#888",
            }}>
              <span style={{ color: activeTool.color }}>💡 </span>
              {activeTool.description}
            </div>
          </div>
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Recent Generations
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {history.map((h, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "#666",
                }}>
                  <span style={{ color: "#888" }}>{h.tool}</span> · {h.input}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer / Sell CTA */}
        <div style={{
          marginTop: 32, textAlign: "center",
          padding: "24px", borderRadius: 16,
          background: "linear-gradient(135deg, rgba(0,229,160,0.06), rgba(167,139,250,0.06))",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
            🚀 This tool is <strong style={{ color: "#fff" }}>ready to sell</strong> to small businesses
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            Charge $29–$99/month · White-label it · Sell on Flippa, MicroAcquire, or directly
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { 0%,100%{opacity:0.05} 50%{opacity:0.12} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
