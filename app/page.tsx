"use client";

import { UserButton } from "@clerk/nextjs";
import { useMemo, useState } from "react";

type Chain = "Solana" | "EVM" | "Sui";
type Filter = "All chains" | Chain;
type Period = "24H" | "7D" | "30D" | "90D" | "1Y";
type IconName = "grid" | "layers" | "chart" | "search" | "eye" | "eyeOff" | "arrowUp" | "arrowDown" | "chevron" | "menu";

const chainInfo: Record<Chain, { color: string; mark: string }> = {
  Solana: { color: "var(--solana)", mark: "◎" },
  EVM: { color: "var(--evm)", mark: "◆" },
  Sui: { color: "var(--sui)", mark: "◈" },
};

const chainChoices: { chain: Chain; label: string; description: string }[] = [
  { chain: "Solana", label: "SOL", description: "Explore your Solana assets" },
  { chain: "EVM", label: "EVM", description: "Explore Ethereum and EVM assets" },
  { chain: "Sui", label: "SUI", description: "Explore your Sui assets" },
];

const holdings: { name: string; symbol: string; chain: Chain; quantity: string; price: number; value: number; change: number; icon: string; iconClass: string }[] = [
  { name: "Solana", symbol: "SOL", chain: "Solana", quantity: "289.142", price: 167.03, value: 48296.18, change: 5.24, icon: "◎", iconClass: "token-sol" },
  { name: "Ethereum", symbol: "ETH", chain: "EVM", quantity: "11.485", price: 3199.41, value: 36745.2, change: 2.81, icon: "◆", iconClass: "token-eth" },
  { name: "Jupiter", symbol: "JUP", chain: "Solana", quantity: "19,882.889", price: 0.9, value: 17892.6, change: 8.46, icon: "J", iconClass: "token-jup" },
  { name: "Sui", symbol: "SUI", chain: "Sui", quantity: "5,776.376", price: 2.925, value: 16894.64, change: -1.32, icon: "◈", iconClass: "token-sui" },
  { name: "USD Coin", symbol: "USDC", chain: "Solana", quantity: "15,052.02", price: 1, value: 15052.02, change: 0.01, icon: "$", iconClass: "token-usdc" },
  { name: "USD Coin", symbol: "USDC", chain: "EVM", quantity: "14,128.50", price: 1, value: 14128.5, change: 0.01, icon: "$", iconClass: "token-usdc" },
  { name: "Uniswap", symbol: "UNI", chain: "EVM", quantity: "628.873", price: 12, value: 7546.48, change: -2.17, icon: "U", iconClass: "token-uni" },
  { name: "Cetus", symbol: "CETUS", chain: "Sui", quantity: "25,601.6", price: 0.2, value: 5120.32, change: 4.09, icon: "C", iconClass: "token-cetus" },
  { name: "USD Coin", symbol: "USDC", chain: "Sui", quantity: "2,854.36", price: 1, value: 2854.36, change: 0.01, icon: "$", iconClass: "token-usdc" },
];

const periods: Period[] = ["24H", "7D", "30D", "90D", "1Y"];
const periodData: Record<Period, { change: number; amount: number; points: number[] }> = {
  "24H": { change: 2.84, amount: 4545.93, points: [29, 28, 31, 30, 33, 31, 35, 34, 32, 36, 39, 37, 38, 41, 39, 44, 42, 46, 45, 48, 47, 51, 50, 54] },
  "7D": { change: 6.18, amount: 9576.42, points: [24, 26, 25, 29, 31, 28, 32, 30, 35, 37, 34, 39, 38, 42, 40, 44, 43, 46, 45, 50, 48, 53, 51, 56] },
  "30D": { change: 12.48, amount: 18261.27, points: [21, 24, 23, 28, 26, 31, 29, 33, 32, 30, 36, 35, 39, 38, 43, 41, 45, 44, 48, 46, 50, 49, 53, 57] },
  "90D": { change: 19.32, amount: 26648.15, points: [18, 21, 24, 23, 27, 29, 26, 31, 34, 33, 36, 39, 37, 41, 44, 42, 46, 48, 45, 51, 50, 54, 52, 58] },
  "1Y": { change: 38.75, amount: 45943.84, points: [13, 16, 15, 19, 22, 21, 27, 24, 29, 32, 30, 35, 33, 37, 40, 38, 44, 42, 48, 46, 51, 49, 55, 59] },
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 16 4-5 3 3 5-7" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18M10.6 6.1A10.9 10.9 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-3.1 3.7M6.2 6.8C3.5 8.6 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.2-1" /><path d="M10 10a3 3 0 0 0 4 4" /></>,
    arrowUp: <path d="m7 14 5-5 5 5M12 9v11" />,
    arrowDown: <path d="m7 10 5 5 5-5M12 4v11" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const compactMoney = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 0 }).format(value);

function PerformanceChart({ period, filter, total, hidden }: { period: Period; filter: Filter; total: number; hidden: boolean }) {
  const points = periodData[period].points.map((point, index) => {
    const offset = filter === "Solana" ? Math.sin(index * 1.2) * 2 : filter === "EVM" ? Math.cos(index * 0.9) * 3 : filter === "Sui" ? Math.sin(index * 1.5) * 4 : 0;
    return { x: (index / 23) * 700, y: 165 - ((point + offset - 10) / 52) * 125 };
  });
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  return <div className="chart-wrap" role="img" aria-label={`${filter} sample portfolio performance chart for ${period}, trending upward`}>
    <div className="chart-axis">{[1.08, 1, 0.92, 0.84].map(multiplier => <span key={multiplier}>{hidden ? "••••" : compactMoney(total * multiplier)}</span>)}</div>
    <svg className="chart-svg" viewBox="0 0 700 190" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#635bff" stopOpacity=".2" /><stop offset="100%" stopColor="#635bff" stopOpacity="0" /></linearGradient></defs>
      {[28, 72, 116, 160].map(y => <line key={y} x1="0" x2="700" y1={y} y2={y} className="grid-line" />)}
      <path d={`${line} L700 190 L0 190 Z`} fill="url(#chartFill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last.x} cy={last.y} r="5" fill="var(--accent)" stroke="white" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg>
    <div className="chart-labels"><span>{period === "24H" ? "12 AM" : period === "7D" ? "Mon" : period === "1Y" ? "Jan" : "Start"}</span><span>{period === "24H" ? "6 AM" : period === "7D" ? "Wed" : period === "1Y" ? "Apr" : ""}</span><span>{period === "24H" ? "12 PM" : period === "7D" ? "Fri" : period === "1Y" ? "Jul" : ""}</span><span>{period === "24H" ? "6 PM" : period === "7D" ? "Sun" : period === "1Y" ? "Oct" : "Today"}</span></div>
  </div>;
}

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [filter, setFilter] = useState<Filter>("All chains");
  const [period, setPeriod] = useState<Period>("30D");
  const [hidden, setHidden] = useState(false);
  const [query, setQuery] = useState("");
  const [sortDescending, setSortDescending] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const chainTotals = useMemo(() => ({
    Solana: holdings.filter(item => item.chain === "Solana").reduce((sum, item) => sum + item.value, 0),
    EVM: holdings.filter(item => item.chain === "EVM").reduce((sum, item) => sum + item.value, 0),
    Sui: holdings.filter(item => item.chain === "Sui").reduce((sum, item) => sum + item.value, 0),
  }), []);
  const total = Object.values(chainTotals).reduce((sum, value) => sum + value, 0);
  const visibleTotal = filter === "All chains" ? total : chainTotals[filter];
  const visibleHoldings = holdings.filter(item => (filter === "All chains" || item.chain === filter) && `${item.name} ${item.symbol} ${item.chain}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sortDescending ? b.value - a.value : a.value - b.value);
  const displayMoney = (value: number) => hidden ? "••••••" : money(value);
  const currentChange = periodData[period];

  if (selectedChain === null) {
    return <main className="chain-entry">
      <div className="chain-entry-shell">
        <div className="chain-entry-brand"><span className="brand-mark"><span /></span><span>orbit<span className="brand-dot">.</span></span></div>
        <div className="chain-entry-content">
          <span className="eyebrow">YOUR PORTFOLIO STARTS HERE</span>
          <h1>Choose a chain<span className="title-period">.</span></h1>
          <p>Select a network to open its portfolio overview. You can switch networks at any time.</p>
          <div className="chain-choice-grid" aria-label="Choose a chain">
            {chainChoices.map(({ chain, label, description }) => <button
              className={`chain-choice chain-choice-${chain.toLowerCase()}`}
              key={chain}
              type="button"
              onClick={() => { setFilter(chain); setQuery(""); setSelectedChain(chain); }}
              aria-label={`Open ${chain} portfolio`}
            >
              <span className={`chain-choice-icon ${chain.toLowerCase()}`}>{chainInfo[chain].mark}</span>
              <span className="chain-choice-body"><strong>{label}</strong><small>{description}</small></span>
              <Icon name="chevron" size={20} />
            </button>)}
          </div>
          <span className="chain-entry-note"><span className="status-dot" /> Sample portfolio data</span>
        </div>
        <div className="chain-entry-footer">One view. Every chain.</div>
      </div>
    </main>;
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`} aria-label="Primary navigation">
      <a className="brand" href="#overview" onClick={() => setMobileNavOpen(false)}><span className="brand-mark"><span /></span><span>orbit<span className="brand-dot">.</span></span></a>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="nav-list">
        <a className="nav-link active" href="#overview" onClick={() => setMobileNavOpen(false)}><Icon name="grid" />Overview</a>
        <a className="nav-link" href="#networks" onClick={() => setMobileNavOpen(false)}><Icon name="layers" />Networks</a>
        <a className="nav-link" href="#assets" onClick={() => setMobileNavOpen(false)}><Icon name="chart" />Assets</a>
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-sparkle">✦</span><strong>One view. Every chain.</strong><p>Track your assets across your favorite ecosystems.</p></div><div className="sidebar-profile"><span className="profile-avatar">OP</span><span><strong>My portfolio</strong><small>Demo workspace</small></span><Icon name="chevron" size={16} /></div></div>
    </aside>
    <div className="main-column" id="overview">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" type="button" aria-label={mobileNavOpen ? "Close menu" : "Open menu"} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(!mobileNavOpen)}><Icon name="menu" /></button><span className="breadcrumb">Workspace</span><Icon name="chevron" size={14} /><strong>Overview</strong></div><div className="topbar-right"><button className="change-chain-button" type="button" onClick={() => { setMobileNavOpen(false); setSelectedChain(null); }}><Icon name="layers" size={16} />Choose chain</button><span className="demo-pill"><span className="status-dot" />Demo data</span><UserButton /></div></header>
      <main className="content">
        <div className="page-heading"><div><div className="eyebrow">YOUR DASHBOARD <span className="eyebrow-line" /></div><h1>Portfolio overview<span className="title-period">.</span></h1><p>All your assets, across every chain, in one clear view.</p></div><button className="privacy-button" type="button" onClick={() => setHidden(!hidden)} aria-label={hidden ? "Show balances" : "Hide balances"}><Icon name={hidden ? "eye" : "eyeOff"} size={17} />{hidden ? "Show balances" : "Hide balances"}</button></div>
        <div className="filter-row" aria-label="Filter portfolio by network">{(["All chains", "Solana", "EVM", "Sui"] as Filter[]).map(chain => <button key={chain} className={`filter-pill ${filter === chain ? "selected" : ""}`} type="button" aria-pressed={filter === chain} onClick={() => setFilter(chain)}>{chain !== "All chains" && <span className={`filter-chain-icon ${chain.toLowerCase()}`}>{chainInfo[chain].mark}</span>}{chain}</button>)}</div>
        <section className="hero-grid" aria-label="Portfolio performance"><div className="balance-card"><div className="balance-card-top"><span className="card-kicker">TOTAL PORTFOLIO VALUE</span><span className="balance-decoration">↗</span></div><div className="balance-main">{displayMoney(visibleTotal)}</div><div className="balance-change"><span className="change-badge"><Icon name="arrowUp" size={15} />+{currentChange.change.toFixed(2)}%</span><span>{hidden ? "••••••" : `+${money(currentChange.amount * (visibleTotal / total))}`} <span className="change-muted">in the last {period === "24H" ? "24 hours" : period === "7D" ? "7 days" : period === "30D" ? "30 days" : period === "90D" ? "90 days" : "year"}</span></span></div><div className="balance-bottom"><div className="avatar-stack"><span className="avatar-chain sol">◎</span><span className="avatar-chain evm">◆</span><span className="avatar-chain sui">◈</span></div><span>Across <strong>{filter === "All chains" ? 3 : 1} {filter === "All chains" ? "networks" : "network"}</strong> · <strong>{filter === "All chains" ? holdings.length : holdings.filter(item => item.chain === filter).length} assets</strong></span></div></div>
          <div className="chart-card"><div className="chart-header"><div><span className="card-kicker">PORTFOLIO PERFORMANCE</span><h2>Growth over time</h2></div><div className="period-control" aria-label="Chart period">{periods.map(item => <button type="button" key={item} aria-pressed={period === item} className={period === item ? "period-active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div></div><PerformanceChart period={period} filter={filter} total={visibleTotal} hidden={hidden} /></div></section>
        <section id="networks" className="networks-section"><div className="section-heading"><div><span className="eyebrow">THE BIG PICTURE</span><h2>Across your networks</h2></div><span className="section-meta">3 networks in demo</span></div><div className="network-grid">{(["Solana", "EVM", "Sui"] as Chain[]).map(chain => { const info = chainInfo[chain]; const percentage = (chainTotals[chain] / total) * 100; return <button type="button" key={chain} className={`network-card ${filter === chain ? "network-selected" : ""}`} onClick={() => setFilter(filter === chain ? "All chains" : chain)} aria-pressed={filter === chain}><span className="network-top"><span className={`network-icon ${chain.toLowerCase()}`}>{info.mark}</span><Icon name="chevron" size={18} /></span><span className="network-name">{chain}</span><span className="network-value">{displayMoney(chainTotals[chain])}</span><span className="network-footer"><span>{percentage.toFixed(1)}% of portfolio</span><span>{holdings.filter(item => item.chain === chain).length} assets</span></span><span className="network-progress"><span style={{ width: `${percentage}%`, background: info.color }} /></span></button>; })}</div></section>
        <section id="assets" className="assets-section"><div className="section-heading"><div><span className="eyebrow">YOUR HOLDINGS</span><h2>Assets</h2></div><span className="section-meta">{visibleHoldings.length} of {holdings.length} assets</span></div><div className="assets-card"><div className="assets-toolbar"><div className="search-field"><Icon name="search" size={18} /><input type="search" aria-label="Search assets" placeholder="Search assets or networks" value={query} onChange={event => setQuery(event.target.value)} /></div><button className="sort-button" type="button" onClick={() => setSortDescending(!sortDescending)}>Value {sortDescending ? "high to low" : "low to high"}<Icon name={sortDescending ? "arrowDown" : "arrowUp"} size={16} /></button></div><div className="table-scroll"><table><thead><tr><th>Asset</th><th>Network</th><th className="numeric">Price</th><th className="numeric">24h change</th><th className="numeric">Balance</th><th className="numeric">Value</th></tr></thead><tbody>{visibleHoldings.map((item, index) => <tr key={`${item.chain}-${item.symbol}-${index}`}><td><div className="asset-identity"><span className={`token-icon ${item.iconClass}`}>{item.icon}</span><span><strong>{item.name}</strong><small>{item.symbol}</small></span></div></td><td><span className="table-chain"><span className={`chain-dot ${item.chain.toLowerCase()}`} />{item.chain}</span></td><td className="numeric">{displayMoney(item.price)}</td><td className={`numeric ${item.change < 0 ? "negative" : "positive"}`}>{item.change > 0 ? "+" : ""}{item.change.toFixed(2)}%</td><td className="numeric balance-qty">{hidden ? "••••" : `${item.quantity} ${item.symbol}`}</td><td className="numeric value-cell">{displayMoney(item.value)}</td></tr>)}</tbody></table>{visibleHoldings.length === 0 && <div className="empty-state"><strong>No matching assets</strong><p>Try another asset name or switch to all chains.</p><button type="button" onClick={() => { setQuery(""); setFilter("All chains"); }}>Clear filters</button></div>}</div><div className="table-footer"><span>Showing sample portfolio data</span><span>Values shown in USD</span></div></div></section>
        <footer className="page-footer"><span>Orbit portfolio · Demo preview</span><span>Solana · EVM · Sui</span></footer>
      </main>
    </div>
  </div>;
}
