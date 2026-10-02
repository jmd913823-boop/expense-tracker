import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Wallet, TrendingDown, X } from "lucide-react";

const CATEGORIES = [
  { key: "food", label: "Food", color: "#B8433D" },
  { key: "travel", label: "Travel", color: "#C9A227" },
  { key: "shopping", label: "Shopping", color: "#6B5B95" },
  { key: "bills", label: "Bills", color: "#3E6B8A" },
  { key: "health", label: "Health", color: "#4C7A57" },
  { key: "other", label: "Other", color: "#8A8477" },
];

const catInfo = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[5];

function monthKey(dateStr) {
  return dateStr.slice(0, 7); // YYYY-MM
}

function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBudget, setShowBudget] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayStr());
  const [budgetInput, setBudgetInput] = useState("");

  // load
  useEffect(() => {
    try {
      const e = localStorage.getItem("expenses");
      if (e) setExpenses(JSON.parse(e));
    } catch (err) {}
    try {
      const b = localStorage.getItem("budget");
      if (b) setBudget(JSON.parse(b));
    } catch (err) {}
    setLoaded(true);
  }, []);

  const persistExpenses = (list) => {
    setExpenses(list);
    try {
      localStorage.setItem("expenses", JSON.stringify(list));
    } catch (err) {}
  };

  const persistBudget = (val) => {
    setBudget(val);
    try {
      localStorage.setItem("budget", JSON.stringify(val));
    } catch (err) {}
  };

  const currentMonth = todayStr().slice(0, 7);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === currentMonth),
    [expenses, currentMonth]
  );

  const monthTotal = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses]
  );

  const byCategory = useMemo(() => {
    const map = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([key, total]) => ({ key, total, ...catInfo(key) }))
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses]);

  const grouped = useMemo(() => {
    const map = {};
    [...expenses]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .forEach((e) => {
        map[e.date] = map[e.date] || [];
        map[e.date].push(e);
      });
    return Object.entries(map);
  }, [expenses]);

  const remaining = budget - monthTotal;
  const overBudget = budget > 0 && remaining < 0;
  const pctUsed = budget > 0 ? Math.min(100, (monthTotal / budget) * 100) : 0;

  const addExpense = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    const entry = {
      id: Date.now().toString(),
      amount: num,
      category,
      note: note.trim(),
      date,
    };
    persistExpenses([entry, ...expenses]);
    setAmount("");
    setNote("");
    setCategory("food");
    setDate(todayStr());
    setShowForm(false);
  };

  const removeExpense = (id) => {
    persistExpenses(expenses.filter((e) => e.id !== id));
  };

  const saveBudget = () => {
    const num = parseFloat(budgetInput);
    if (!isNaN(num) && num >= 0) {
      persistBudget(num);
    }
    setShowBudget(false);
    setBudgetInput("");
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F5F0" }} />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F5F0",
        color: "#1B2430",
        fontFamily:
          "'Lora', Georgia, 'Times New Roman', serif",
        paddingBottom: "100px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .num { font-family: 'Inter', sans-serif; font-variant-numeric: tabular-nums; }
        button { font-family: 'Inter', sans-serif; cursor: pointer; }
        input, select { font-family: 'Inter', sans-serif; }
        .row-enter { animation: slideIn 0.25s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .sheet-enter { animation: sheetUp 0.2s ease-out; }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "#1B2430",
          color: "#F7F5F0",
          padding: "28px 20px 24px",
          borderBottomLeftRadius: "18px",
          borderBottomRightRadius: "18px",
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            letterSpacing: "0.02em",
            color: "#C9A227",
            marginBottom: "6px",
          }}
        >
          {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </div>
        <div style={{ fontSize: "38px", lineHeight: 1.1, fontWeight: 500 }} className="num">
          {formatINR(monthTotal)}
        </div>
        <div style={{ fontSize: "14px", color: "#B9BEC7", marginTop: "2px" }}>
          spent this month
        </div>

        {budget > 0 ? (
          <div style={{ marginTop: "18px" }}>
            <div
              style={{
                height: "6px",
                background: "rgba(247,245,240,0.15)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pctUsed}%`,
                  background: overBudget ? "#B8433D" : "#C9A227",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
                fontSize: "13px",
                fontFamily: "'Inter', sans-serif",
                color: overBudget ? "#E38079" : "#B9BEC7",
              }}
            >
              <span>
                {overBudget
                  ? `${formatINR(Math.abs(remaining))} over budget`
                  : `${formatINR(remaining)} left`}
              </span>
              <button
                onClick={() => setShowBudget(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#C9A227",
                  fontSize: "13px",
                  padding: 0,
                }}
              >
                Edit budget
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowBudget(true)}
            style={{
              marginTop: "16px",
              background: "rgba(247,245,240,0.1)",
              border: "1px solid rgba(247,245,240,0.25)",
              color: "#F7F5F0",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Wallet size={14} /> Set a monthly budget
          </button>
        )}
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div style={{ padding: "20px 20px 4px" }}>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "#8A8477",
              marginBottom: "10px",
            }}
          >
            By category
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {byCategory.map((c) => (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: c.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: "14px", width: "80px", flexShrink: 0 }}>{c.label}</div>
                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    background: "#EAE6DC",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(c.total / monthTotal) * 100}%`,
                      background: c.color,
                    }}
                  />
                </div>
                <div className="num" style={{ fontSize: "13px", width: "64px", textAlign: "right", flexShrink: 0 }}>
                  {formatINR(c.total)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div style={{ padding: "24px 20px 0" }}>
        {grouped.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#8A8477",
              fontSize: "15px",
            }}
          >
            No expenses yet. Tap the + button to add your first one.
          </div>
        ) : (
          grouped.map(([d, items]) => (
            <div key={d} style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  color: "#8A8477",
                  marginBottom: "8px",
                }}
              >
                {new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </div>
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1px solid #EAE6DC",
                  overflow: "hidden",
                }}
              >
                {items.map((e, i) => {
                  const info = catInfo(e.category);
                  return (
                    <div
                      key={e.id}
                      className="row-enter"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "13px 14px",
                        borderBottom: i < items.length - 1 ? "1px solid #F0EDE5" : "none",
                      }}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "9px",
                          background: info.color + "1A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: info.color,
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "15px" }}>{info.label}</div>
                        {e.note && (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#8A8477",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {e.note}
                          </div>
                        )}
                      </div>
                      <div className="num" style={{ fontSize: "15px", fontWeight: 500 }}>
                        {formatINR(e.amount)}
                      </div>
                      <button
                        onClick={() => removeExpense(e.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#C9C4B6",
                          padding: "4px",
                          display: "flex",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setShowForm(true)}
        style={{
          position: "fixed",
          bottom: "28px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#1B2430",
          color: "#C9A227",
          border: "none",
          boxShadow: "0 6px 18px rgba(27,36,48,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={26} />
      </button>

      {/* Add expense sheet */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,36,48,0.4)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 50,
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="sheet-enter"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#F7F5F0",
              width: "100%",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              padding: "20px 20px 28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "18px", fontWeight: 500 }}>Add expense</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#8A8477" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#8A8477" }}>Amount</label>
              <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #1B2430", paddingBottom: "4px", marginTop: "4px" }}>
                <span className="num" style={{ fontSize: "20px", marginRight: "4px" }}>₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="num"
                  style={{ border: "none", background: "none", fontSize: "20px", flex: 1, outline: "none" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#8A8477" }}>Category</label>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    style={{
                      padding: "7px 13px",
                      borderRadius: "20px",
                      border: category === c.key ? `2px solid ${c.color}` : "1px solid #EAE6DC",
                      background: category === c.key ? c.color + "1A" : "#FFFFFF",
                      fontSize: "13px",
                      color: "#1B2430",
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "18px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#8A8477" }}>Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. lunch with friends"
                  style={{
                    width: "100%",
                    border: "1px solid #EAE6DC",
                    borderRadius: "8px",
                    padding: "9px 10px",
                    fontSize: "14px",
                    marginTop: "4px",
                    outline: "none",
                    background: "#FFFFFF",
                  }}
                />
              </div>
              <div style={{ width: "130px" }}>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#8A8477" }}>Date</label>
                <input
                  type="date"
                  value={date}
                  max={todayStr()}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: "100%",
                    border: "1px solid #EAE6DC",
                    borderRadius: "8px",
                    padding: "9px 10px",
                    fontSize: "13px",
                    marginTop: "4px",
                    outline: "none",
                    background: "#FFFFFF",
                  }}
                />
              </div>
            </div>

            <button
              onClick={addExpense}
              disabled={!amount || parseFloat(amount) <= 0}
              style={{
                width: "100%",
                background: !amount || parseFloat(amount) <= 0 ? "#C9C4B6" : "#1B2430",
                color: "#F7F5F0",
                border: "none",
                borderRadius: "10px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Save expense
            </button>
          </div>
        </div>
      )}

      {/* Budget sheet */}
      {showBudget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,36,48,0.4)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 50,
          }}
          onClick={() => setShowBudget(false)}
        >
          <div
            className="sheet-enter"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#F7F5F0",
              width: "100%",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              padding: "20px 20px 28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "18px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingDown size={18} color="#C9A227" /> Monthly budget
              </div>
              <button onClick={() => setShowBudget(false)} style={{ background: "none", border: "none", color: "#8A8477" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #1B2430", paddingBottom: "4px", marginBottom: "18px" }}>
              <span className="num" style={{ fontSize: "20px", marginRight: "4px" }}>₹</span>
              <input
                type="number"
                inputMode="decimal"
                autoFocus
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder={budget > 0 ? budget.toString() : "0"}
                className="num"
                style={{ border: "none", background: "none", fontSize: "20px", flex: 1, outline: "none" }}
              />
            </div>
            <button
              onClick={saveBudget}
              style={{
                width: "100%",
                background: "#1B2430",
                color: "#F7F5F0",
                border: "none",
                borderRadius: "10px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Save budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
