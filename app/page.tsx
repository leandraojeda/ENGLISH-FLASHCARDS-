"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  Library,
  Plus,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type Card = {
  id: string;
  english: string;
  spanish: string;
  example: string;
  created_at: string;
  correct_count: number;
  incorrect_count: number;
};

type Screen = "home" | "add" | "review" | "library";

const starterCards: Card[] = [
  {
    id: "welcome-1",
    english: "Break the ice",
    spanish: "Romper el hielo",
    example: "A joke can help break the ice.",
    created_at: new Date().toISOString(),
    correct_count: 2,
    incorrect_count: 0,
  },
  {
    id: "welcome-2",
    english: "Curious",
    spanish: "Curioso / curiosa",
    example: "I am curious about the world.",
    created_at: new Date().toISOString(),
    correct_count: 1,
    incorrect_count: 1,
  },
  {
    id: "welcome-3",
    english: "Keep going",
    spanish: "Sigue adelante",
    example: "Keep going, you are doing great!",
    created_at: new Date().toISOString(),
    correct_count: 0,
    incorrect_count: 0,
  },
];

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

const supabase = getSupabase();

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [reviewIndex, setReviewIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [form, setForm] = useState({ english: "", spanish: "", example: "" });

  const loadCards = useCallback(async () => {
    if (supabase) {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setCards(data);
        setLoading(false);
        return;
      }
    }
    const saved = localStorage.getItem("english-flashcards");
    setCards(saved ? JSON.parse(saved) : starterCards);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const persistLocal = (next: Card[]) => {
    setCards(next);
    localStorage.setItem("english-flashcards", JSON.stringify(next));
  };

  const addCard = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.english.trim() || !form.spanish.trim()) return;
    const card: Card = {
      id: crypto.randomUUID(),
      english: form.english.trim(),
      spanish: form.spanish.trim(),
      example: form.example.trim(),
      created_at: new Date().toISOString(),
      correct_count: 0,
      incorrect_count: 0,
    };
    if (supabase) {
      const { data, error } = await supabase
        .from("flashcards")
        .insert(card)
        .select()
        .single();
      if (error) {
        setNotice("No se pudo guardar en la nube. Revisa la configuración.");
        return;
      }
      setCards((current) => [data, ...current]);
    } else {
      persistLocal([card, ...cards]);
    }
    setForm({ english: "", spanish: "", example: "" });
    setNotice("¡Tarjeta guardada! +10 XP");
    setTimeout(() => {
      setNotice("");
      setScreen("home");
    }, 900);
  };

  const normalize = (value: string) =>
    value
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[¿?¡!.,]/g, "")
      .trim();

  const checkAnswer = () => {
    if (!answer.trim() || !cards[reviewIndex]) return;
    const expected = normalize(cards[reviewIndex].spanish);
    const given = normalize(answer);
    const alternatives = expected.split(/\s*[\/,;]\s*/);
    const isCorrect =
      expected === given ||
      alternatives.some((option) => option === given) ||
      (given.length > 3 && expected.includes(given));
    setResult(isCorrect ? "correct" : "incorrect");
    setScore((current) => ({
      correct: current.correct + (isCorrect ? 1 : 0),
      total: current.total + 1,
    }));
    updateCardStats(cards[reviewIndex], isCorrect);
  };

  const updateCardStats = async (card: Card, correct: boolean) => {
    const updated = {
      ...card,
      correct_count: card.correct_count + (correct ? 1 : 0),
      incorrect_count: card.incorrect_count + (correct ? 0 : 1),
    };
    const next = cards.map((item) => (item.id === card.id ? updated : item));
    setCards(next);
    if (supabase) {
      await supabase
        .from("flashcards")
        .update({
          correct_count: updated.correct_count,
          incorrect_count: updated.incorrect_count,
        })
        .eq("id", card.id);
    } else {
      localStorage.setItem("english-flashcards", JSON.stringify(next));
    }
  };

  const nextReview = () => {
    setAnswer("");
    setResult(null);
    if (reviewIndex < cards.length - 1) setReviewIndex(reviewIndex + 1);
    else setScreen("home");
  };

  const startReview = () => {
    setReviewIndex(0);
    setAnswer("");
    setResult(null);
    setScore({ correct: 0, total: 0 });
    setScreen("review");
  };

  const accuracy = useMemo(() => {
    const correct = cards.reduce((sum, card) => sum + card.correct_count, 0);
    const attempts = cards.reduce(
      (sum, card) => sum + card.correct_count + card.incorrect_count,
      0,
    );
    return attempts ? Math.round((correct / attempts) * 100) : 0;
  }, [cards]);

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="brand-mark">F</div>
        <p>Preparando tu práctica...</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("home")}>
          <span className="brand-mark">F</span>
          <span>
            FLUENT<span className="brand-accent">UP</span>
          </span>
        </button>
        <div className="streak">
          <Flame size={21} fill="currentColor" /> <strong>7</strong>
          <span>días</span>
        </div>
      </header>

      {screen === "home" && (
        <section className="dashboard">
          <div className="welcome">
            <div>
              <span className="eyebrow">
                <Sparkles size={15} /> TU INGLÉS, A TU RITMO
              </span>
              <h1>
                ¡Hola, <span>Leandra!</span>
              </h1>
              <p>Cada palabra nueva te acerca a hablar con confianza.</p>
            </div>
            <div className="level-badge">
              <Trophy size={25} />
              <span>NIVEL</span>
              <strong>2</strong>
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-top">
              <div>
                <span>PROGRESO SEMANAL</span>
                <strong>{Math.max(cards.length * 10, 30)} XP</strong>
              </div>
              <span>Meta: 100 XP</span>
            </div>
            <div className="progress-track">
              <span
                style={{ width: `${Math.min(cards.length * 10, 100)}%` }}
              />
            </div>
            <div className="week">
              {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                <div key={`${day}-${index}`}>
                  <span className={index < 4 ? "day done" : "day"}>
                    {index < 4 ? <Check size={14} /> : day}
                  </span>
                  <small>{index === 3 ? "HOY" : ""}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="section-heading">
            <div>
              <span className="eyebrow">CONTINÚA APRENDIENDO</span>
              <h2>¿Qué haremos hoy?</h2>
            </div>
            <span className="cloud-status">
              <i /> {supabase ? "Sincronizado" : "Modo local"}
            </span>
          </div>

          <div className="action-grid">
            <button className="action-card add" onClick={() => setScreen("add")}>
              <span className="action-icon">
                <Plus />
              </span>
              <span>
                <small>NUEVO</small>
                <strong>Añadir palabras</strong>
                <p>Guarda lo que aprendiste hoy</p>
              </span>
              <ChevronRight />
            </button>
            <button
              className="action-card review"
              onClick={startReview}
              disabled={!cards.length}
            >
              <span className="action-icon">
                <RotateCcw />
              </span>
              <span>
                <small>PRÁCTICA</small>
                <strong>Repasar ahora</strong>
                <p>{cards.length} tarjetas por dominar</p>
              </span>
              <ChevronRight />
            </button>
          </div>

          <div className="stats-grid">
            <article>
              <BookOpen />
              <span>
                <strong>{cards.length}</strong>
                <small>PALABRAS</small>
              </span>
            </article>
            <article>
              <Trophy />
              <span>
                <strong>{accuracy}%</strong>
                <small>PRECISIÓN</small>
              </span>
            </article>
            <button onClick={() => setScreen("library")}>
              <Library />
              <span>
                <strong>Mi colección</strong>
                <small>VER TODAS</small>
              </span>
              <ChevronRight />
            </button>
          </div>
        </section>
      )}

      {screen === "add" && (
        <section className="focus-screen">
          <button className="back" onClick={() => setScreen("home")}>
            <ArrowLeft /> Volver
          </button>
          <div className="form-card">
            <span className="large-icon lime">
              <Plus />
            </span>
            <span className="eyebrow">NUEVO APRENDIZAJE</span>
            <h1>Añade una tarjeta</h1>
            <p>Escribe una palabra o frase que quieras recordar.</p>
            <form onSubmit={addCard}>
              <label>
                PALABRA O FRASE EN INGLÉS
                <input
                  autoFocus
                  placeholder="Ej. Take it easy"
                  value={form.english}
                  onChange={(event) =>
                    setForm({ ...form, english: event.target.value })
                  }
                  required
                />
              </label>
              <label>
                SIGNIFICADO EN ESPAÑOL
                <input
                  placeholder="Ej. Tómatelo con calma"
                  value={form.spanish}
                  onChange={(event) =>
                    setForm({ ...form, spanish: event.target.value })
                  }
                  required
                />
              </label>
              <label>
                EJEMPLO (OPCIONAL)
                <textarea
                  placeholder="Ej. Take it easy, everything will be fine."
                  value={form.example}
                  onChange={(event) =>
                    setForm({ ...form, example: event.target.value })
                  }
                />
              </label>
              <button className="primary-button" type="submit">
                GUARDAR TARJETA <ChevronRight />
              </button>
            </form>
            {notice && <div className="toast">{notice}</div>}
          </div>
        </section>
      )}

      {screen === "review" && cards[reviewIndex] && (
        <section className="focus-screen review-screen">
          <div className="review-header">
            <button className="back" onClick={() => setScreen("home")}>
              <X /> Salir
            </button>
            <div className="review-progress">
              <span
                style={{
                  width: `${((reviewIndex + 1) / cards.length) * 100}%`,
                }}
              />
            </div>
            <strong>
              {reviewIndex + 1}/{cards.length}
            </strong>
          </div>
          <div className={`quiz-card ${result ?? ""}`}>
            <span className="eyebrow">TRADUCE AL ESPAÑOL</span>
            <h1>{cards[reviewIndex].english}</h1>
            {cards[reviewIndex].example && (
              <p className="example">“{cards[reviewIndex].example}”</p>
            )}
            <label>
              TU RESPUESTA
              <input
                autoFocus
                value={answer}
                disabled={!!result}
                placeholder="Escribe el significado..."
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    if (result) nextReview();
                    else checkAnswer();
                  }
                }}
              />
            </label>
            {!result ? (
              <button className="primary-button purple" onClick={checkAnswer}>
                COMPROBAR
              </button>
            ) : (
              <div className="feedback">
                <span className="feedback-icon">
                  {result === "correct" ? <Check /> : <X />}
                </span>
                <div>
                  <strong>
                    {result === "correct"
                      ? "¡Excelente!"
                      : "Casi lo tienes"}
                  </strong>
                  {result === "incorrect" && (
                    <p>
                      Respuesta: <b>{cards[reviewIndex].spanish}</b>
                    </p>
                  )}
                </div>
                <button onClick={nextReview}>
                  {reviewIndex === cards.length - 1 ? "FINALIZAR" : "SIGUIENTE"}{" "}
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>
          <p className="score-line">
            Aciertos en esta ronda: <strong>{score.correct}</strong> de{" "}
            <strong>{score.total}</strong>
          </p>
        </section>
      )}

      {screen === "library" && (
        <section className="library-screen">
          <button className="back" onClick={() => setScreen("home")}>
            <ArrowLeft /> Volver
          </button>
          <span className="eyebrow">TU COLECCIÓN</span>
          <h1>Palabras aprendidas</h1>
          <p>Todo lo que guardas se convierte en progreso.</p>
          <div className="card-list">
            {cards.map((card) => (
              <article key={card.id}>
                <span className="initial">
                  {card.english.charAt(0).toUpperCase()}
                </span>
                <div>
                  <h3>{card.english}</h3>
                  <p>{card.spanish}</p>
                  {card.example && <small>{card.example}</small>}
                </div>
                <span className="mastery">
                  {card.correct_count} <Check size={14} />
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer>
        <span>FLUENTUP · APRENDE ALGO NUEVO CADA DÍA</span>
        <span>HECHO CON 💜 PARA TU FUTURO</span>
      </footer>
    </main>
  );
}
