import { useState, useEffect, useCallback } from "react";
import { Search, Clock, ChefHat, X, Check, Plus, Flame, Loader2, Sparkles, UtensilsCrossed, Users, ThermometerSun, AlertCircle } from "lucide-react";

// Images
const images = {
  1: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
  2: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
  3: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  4: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  5: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
  6: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80",
};

// API Simulation
const fetchRecipes = async (ingredients) => {
  await new Promise((r) => setTimeout(r, 1000));
  
  const db = [
    { id: 1, title: "Poulet Rôti aux Herbes", desc: "Classique français doré et parfumé", prep: 20, cook: 60, cal: 450, serv: 4, diff: "Moyen", ing: [{ n: "poulet", q: "1.5 kg" }, { n: "tomates", q: "4" }, { n: "oignon", q: "2" }, { n: "ail", q: "6 gousses" }, { n: "thym", q: "4 branches" }, { n: "huile d'olive", q: "3 c.à.s" }], steps: [{ t: "Préchauffer le four", d: "10 min", c: 200 }, { t: "Assaisonner le poulet généreusement", d: "5 min", c: null }, { t: "Disposer légumes autour du poulet", d: "5 min", c: null }, { t: "Enfourner et cuire", d: "50 min", c: 200 }, { t: "Arroser régulièrement du jus", d: "pendant cuisson", c: null }, { t: "Laisser reposer avant découpe", d: "10 min", c: null }] },
    { id: 2, title: "Curry Crémeux au Poulet", desc: "Saveurs exotiques et onctuosité", prep: 15, cook: 35, cal: 520, serv: 4, diff: "Facile", ing: [{ n: "poulet", q: "600g" }, { n: "tomates", q: "400g" }, { n: "oignon", q: "1" }, { n: "lait de coco", q: "400ml" }, { n: "curry", q: "2 c.à.s" }, { n: "gingembre", q: "2 cm" }], steps: [{ t: "Émincer oignon et gingembre", d: "5 min", c: null }, { t: "Faire revenir dans l'huile", d: "5 min", c: null }, { t: "Ajouter curry et poulet", d: "5 min", c: null }, { t: "Verser tomates et lait de coco", d: "2 min", c: null }, { t: "Laisser mijoter à feu doux", d: "25 min", c: null }, { t: "Servir avec coriandre", d: "1 min", c: null }] },
    { id: 3, title: "Salade Méditerranéenne", desc: "Fraîche et colorée", prep: 15, cook: 10, cal: 380, serv: 2, diff: "Facile", ing: [{ n: "poulet", q: "300g" }, { n: "tomates", q: "2" }, { n: "oignon", q: "1 petit" }, { n: "concombre", q: "1" }, { n: "feta", q: "100g" }, { n: "olives", q: "50g" }], steps: [{ t: "Griller les filets de poulet", d: "12 min", c: null }, { t: "Couper tomates en quartiers", d: "3 min", c: null }, { t: "Émincer oignon finement", d: "3 min", c: null }, { t: "Trancher concombre", d: "3 min", c: null }, { t: "Assembler tous les ingrédients", d: "3 min", c: null }, { t: "Assaisonner huile et citron", d: "2 min", c: null }] },
    { id: 4, title: "Pâtes Crémeuses au Poulet", desc: "Gourmandes et irrésistibles", prep: 10, cook: 20, cal: 580, serv: 4, diff: "Facile", ing: [{ n: "pâtes", q: "400g" }, { n: "poulet", q: "400g" }, { n: "tomates séchées", q: "100g" }, { n: "crème", q: "200ml" }, { n: "parmesan", q: "50g" }, { n: "basilic", q: "1 bouquet" }], steps: [{ t: "Cuire les pâtes al dente", d: "12 min", c: null }, { t: "Saisir poulet en lanières", d: "8 min", c: null }, { t: "Ajouter tomates séchées", d: "2 min", c: null }, { t: "Verser crème et réduire", d: "3 min", c: null }, { t: "Mélanger pâtes et parmesan", d: "2 min", c: null }, { t: "Parsemer de basilic frais", d: "1 min", c: null }] },
    { id: 5, title: "Soupe Rustique au Poulet", desc: "Réconfortante et nourrissante", prep: 15, cook: 40, cal: 320, serv: 6, diff: "Facile", ing: [{ n: "poulet", q: "500g" }, { n: "tomates", q: "3" }, { n: "oignon", q: "1" }, { n: "carottes", q: "3" }, { n: "céleri", q: "2 branches" }, { n: "bouillon", q: "1.5L" }], steps: [{ t: "Couper légumes en dés", d: "10 min", c: null }, { t: "Faire revenir l'oignon", d: "5 min", c: null }, { t: "Ajouter carottes et céleri", d: "5 min", c: null }, { t: "Incorporer poulet en morceaux", d: "5 min", c: null }, { t: "Verser bouillon et mijoter", d: "35 min", c: null }, { t: "Servir avec persil", d: "1 min", c: null }] },
    { id: 6, title: "Riz Sauté Teriyaki", desc: "Saveurs asiatiques", prep: 15, cook: 15, cal: 490, serv: 4, diff: "Moyen", ing: [{ n: "poulet", q: "400g" }, { n: "riz", q: "300g cuit" }, { n: "oignon", q: "1" }, { n: "sauce soja", q: "4 c.à.s" }, { n: "miel", q: "2 c.à.s" }, { n: "sésame", q: "1 c.à.s" }], steps: [{ t: "Préparer sauce teriyaki", d: "3 min", c: null }, { t: "Sauter poulet à feu vif", d: "6 min", c: null }, { t: "Faire revenir l'oignon", d: "3 min", c: null }, { t: "Ajouter riz et mélanger", d: "3 min", c: null }, { t: "Verser sauce teriyaki", d: "2 min", c: null }, { t: "Garnir de sésame", d: "1 min", c: null }] },
  ];

  const lower = ingredients.map((i) => i.toLowerCase());
  return db.map((r) => {
    const owned = r.ing.map((i) => ({ ...i, owned: lower.some((u) => i.n.includes(u) || u.includes(i.n)) }));
    return { ...r, ing: owned, score: owned.filter((x) => x.owned).length };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
};

export default function QuickRecipe() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const addIngredient = useCallback(() => {
    const val = input.trim().toLowerCase();
    if (val && !ingredients.includes(val)) {
      setIngredients((prev) => [...prev, val]);
      setInput("");
    }
  }, [input, ingredients]);

  const removeIngredient = (item) => {
    setIngredients((prev) => prev.filter((i) => i !== item));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setSearched(true);
    const results = await fetchRecipes(ingredients);
    setRecipes(results);
    setLoading(false);
  };

  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipe = () => {
    setSelectedRecipe(null);
  };

  // Block scroll when modal is open
  useEffect(() => {
    if (selectedRecipe) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRecipe]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeRecipe();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f4" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 30, backgroundColor: "white", borderBottom: "1px solid #e7e5e4", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 768, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #f97316, #e11d48)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChefHat style={{ width: 24, height: 24, color: "white" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1c1917" }}>QuickRecipe</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#78716c" }}>Cuisinez avec vos ingrédients</p>
          </div>
        </div>
      </header>

      {/* Main Content - ALWAYS VISIBLE */}
      <main style={{ maxWidth: 768, margin: "0 auto", padding: "24px 16px" }}>
        {/* Input Section */}
        <div style={{ backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 24, border: "1px solid #e7e5e4" }}>
          <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 500, color: "#44403c" }}>Quels ingrédients avez-vous ?</p>
          
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, color: "#a8a29e", pointerEvents: "none" }} />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIngredient(); } }}
                placeholder="Ex: poulet, tomate, oignon..."
                style={{ width: "100%", height: 44, paddingLeft: 40, paddingRight: 12, borderRadius: 12, border: "1px solid #d6d3d1", backgroundColor: "#fafaf9", fontSize: 14, outline: "none" }}
              />
            </div>
            <button onClick={addIngredient} style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid #d6d3d1", backgroundColor: "#f5f5f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Plus style={{ width: 20, height: 20, color: "#57534e" }} />
            </button>
          </div>

          {ingredients.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {ingredients.map((item) => (
                <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 6px 6px 12px", backgroundColor: "#ffedd5", color: "#9a3412", borderRadius: 20, fontSize: 14, fontWeight: 500 }}>
                  {item}
                  <button onClick={() => removeIngredient(item)} style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#fdba74", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X style={{ width: 12, height: 12, color: "#9a3412" }} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#a8a29e" }}>Appuyez sur Entrée pour ajouter un ingrédient</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={ingredients.length === 0 || loading}
            style={{ width: "100%", height: 44, borderRadius: 12, border: "none", background: ingredients.length > 0 ? "linear-gradient(135deg, #f97316, #e11d48)" : "#d6d3d1", color: "white", fontSize: 14, fontWeight: 600, cursor: ingredients.length > 0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} /> : <Sparkles style={{ width: 20, height: 20 }} />}
            {loading ? "Recherche..." : "Générer des recettes"}
          </button>
        </div>

        {/* Results Section - STAYS VISIBLE */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <Loader2 style={{ width: 40, height: 40, color: "#f97316", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
            <p style={{ margin: 0, color: "#57534e" }}>Recherche en cours...</p>
          </div>
        ) : searched && recipes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <UtensilsCrossed style={{ width: 40, height: 40, color: "#a8a29e", margin: "0 auto 12px" }} />
            <p style={{ margin: "0 0 4px", fontWeight: 500, color: "#57534e" }}>Aucune recette trouvée</p>
            <p style={{ margin: 0, fontSize: 14, color: "#a8a29e" }}>Essayez d'autres ingrédients</p>
          </div>
        ) : recipes.length > 0 ? (
          <div>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#1c1917" }}>{recipes.length} recette{recipes.length > 1 ? "s" : ""} trouvée{recipes.length > 1 ? "s" : ""}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => openRecipe(recipe)}
                  style={{ backgroundColor: "white", borderRadius: 16, overflow: "hidden", border: "1px solid #e7e5e4", cursor: "pointer", transition: "box-shadow 0.2s, transform 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ position: "relative", height: 140 }}>
                    <img src={images[recipe.id]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
                    <span style={{ position: "absolute", top: 8, right: 8, padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, color: "white", backgroundColor: recipe.diff === "Facile" ? "#10b981" : recipe.diff === "Moyen" ? "#f59e0b" : "#ef4444" }}>{recipe.diff}</span>
                    <h3 style={{ position: "absolute", bottom: 8, left: 12, right: 12, margin: 0, fontSize: 16, fontWeight: 700, color: "white" }}>{recipe.title}</h3>
                  </div>
                  <div style={{ padding: 12 }}>
                    <p style={{ margin: "0 0 8px", fontSize: 13, color: "#78716c" }}>{recipe.desc}</p>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#57534e", marginBottom: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock style={{ width: 14, height: 14 }} />{recipe.prep + recipe.cook} min</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Flame style={{ width: 14, height: 14, color: "#f97316" }} />{recipe.cal} kcal</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users style={{ width: 14, height: 14 }} />{recipe.serv}</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: "#f5f5f4", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", backgroundColor: "#f97316", borderRadius: 3, width: `${(recipe.ing.filter((i) => i.owned).length / recipe.ing.length) * 100}%` }} />
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#a8a29e" }}>{recipe.ing.filter((i) => i.owned).length}/{recipe.ing.length} ingrédients</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      {/* MODAL OVERLAY - TRUE POPUP */}
      {selectedRecipe && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
          onClick={closeRecipe}
        >
          {/* Modal Card - Stops propagation */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 640,
              maxHeight: "80vh",
              backgroundColor: "white",
              borderRadius: 20,
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Close Button - Fixed Top Right */}
            <button
              onClick={closeRecipe}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 20, height: 20, color: "white" }} />
            </button>

            {/* Image Header - Fixed */}
            <div style={{ position: "relative", height: 180, flexShrink: 0 }}>
              <img src={images[selectedRecipe.id]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
                <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, color: "white", backgroundColor: selectedRecipe.diff === "Facile" ? "#10b981" : selectedRecipe.diff === "Moyen" ? "#f59e0b" : "#ef4444", marginBottom: 8 }}>{selectedRecipe.diff}</span>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "white" }}>{selectedRecipe.title}</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{selectedRecipe.desc}</p>
              </div>
            </div>

            {/* Stats Bar - Fixed */}
            <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0", borderBottom: "1px solid #f5f5f4", backgroundColor: "#fafaf9", flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1c1917" }}>{selectedRecipe.prep} min</p>
                <p style={{ margin: 0, fontSize: 11, color: "#a8a29e" }}>Prépa</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1c1917" }}>{selectedRecipe.cook} min</p>
                <p style={{ margin: 0, fontSize: 11, color: "#a8a29e" }}>Cuisson</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#f97316" }}>{selectedRecipe.cal}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#a8a29e" }}>kcal</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1c1917" }}>{selectedRecipe.serv}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#a8a29e" }}>Portions</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {/* Missing Ingredients */}
              {selectedRecipe.ing.filter((i) => !i.owned).length > 0 && (
                <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 12, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <AlertCircle style={{ width: 16, height: 16, color: "#d97706" }} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#92400e" }}>Ingrédients manquants</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedRecipe.ing.filter((i) => !i.owned).map((ing, idx) => (
                      <span key={idx} style={{ padding: "4px 10px", backgroundColor: "white", border: "1px solid #fde68a", borderRadius: 16, fontSize: 12, color: "#92400e" }}>{ing.n} • {ing.q}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Owned Ingredients */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Check style={{ width: 16, height: 16, color: "#10b981" }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#1c1917" }}>Vos ingrédients ({selectedRecipe.ing.filter((i) => i.owned).length})</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedRecipe.ing.filter((i) => i.owned).map((ing, idx) => (
                    <span key={idx} style={{ padding: "4px 10px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 16, fontSize: 12, color: "#065f46" }}>{ing.n} • {ing.q}</span>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#1c1917" }}>Instructions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectedRecipe.steps.map((step, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 12, padding: 12, backgroundColor: "#fafaf9", borderRadius: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#f97316", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, color: "#44403c" }}>{step.t}</p>
                        <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: "#78716c" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock style={{ width: 12, height: 12 }} />{step.d}</span>
                          {step.c && <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f97316" }}><ThermometerSun style={{ width: 12, height: 12 }} />{step.c}°C</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Button - Fixed */}
            <div style={{ padding: 16, borderTop: "1px solid #f5f5f4", backgroundColor: "#fafaf9", flexShrink: 0 }}>
              <button
                onClick={closeRecipe}
                style={{ width: "100%", height: 44, borderRadius: 12, border: "none", backgroundColor: "#1c1917", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      `}</style>
    </div>
  );
}
