/**
 * QuickRecipe - Application de génération de recettes par IA
 * 
 * Configuration requise :
 * 1. Créer un fichier .env à la racine du projet avec :
 *    VITE_OPENROUTER_API_KEY=your_api_key_here
 * 
 * 2. Installer les dépendances :
 *    npm install lucide-react
 * 
 * 3. Lancer le projet :
 *    npm run dev
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Clock,
  ChefHat,
  X,
  Check,
  Plus,
  Flame,
  Loader2,
  Sparkles,
  UtensilsCrossed,
  Users,
  ThermometerSun,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

// Images génériques pour les recettes
const defaultImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  "https://images.unsplash.com/photo-1482049016gy574-e0a8a3-a2e7d?w=800&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80",
];

const getRandomImage = (index) => {
  return defaultImages[index % defaultImages.length];
};

// Messages de chargement amusants
const loadingMessages = [
  "Le chef réfléchit...",
  "Consultation du livre de recettes...",
  "Préparation des suggestions...",
  "L'IA fouille dans sa cuisine...",
  "Analyse des saveurs possibles...",
];

// Fonction d'appel à l'API OpenRouter
const fetchRecipesFromAI = async (ingredients, userIngredients) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API manquante. Ajoutez VITE_OPENROUTER_API_KEY dans votre fichier .env");
  }

  const prompt = `Tu es un chef cuisinier expert. L'utilisateur a ces ingrédients : ${ingredients.join(", ")}.

Génère exactement 3 recettes réalisables avec ces ingrédients (tu peux ajouter des ingrédients basiques que tout le monde a).

IMPORTANT : Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après. Le format doit être :

{
  "recettes": [
    {
      "id": 1,
      "titre": "Nom de la recette",
      "description": "Description courte et appétissante",
      "tempsCuisson": 30,
      "tempsPreparation": 15,
      "temperature": 180,
      "calories": 450,
      "portions": 4,
      "difficulte": "Facile",
      "ingredientsUtilises": ["ingredient1", "ingredient2"],
      "ingredientsManquants": [{"nom": "ingredient", "quantite": "100g"}],
      "etapes": [
        {"numero": 1, "instruction": "Étape détaillée", "duree": "5 min", "temperature": null}
      ]
    }
  ]
}

Assure-toi que :
- tempsCuisson et tempsPreparation sont des nombres (minutes)
- temperature est un nombre (degrés Celsius) ou null si pas de cuisson
- difficulte est "Facile", "Moyen" ou "Difficile"
- Chaque étape a un numéro, une instruction claire, une durée, et une température si applicable`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "QuickRecipe App",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erreur API: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Réponse vide de l'API");
  }

  // Parser le JSON de la réponse
  let parsed;
  try {
    // Nettoyer la réponse (enlever les backticks markdown si présents)
    const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleanContent);
  } catch (e) {
    console.error("Erreur de parsing JSON:", content);
    throw new Error("Format de réponse invalide de l'IA");
  }

  if (!parsed.recettes || !Array.isArray(parsed.recettes)) {
    throw new Error("Structure de réponse invalide");
  }

  // Enrichir les recettes avec les informations de possession des ingrédients
  const lowerUserIngredients = userIngredients.map((i) => i.toLowerCase());

  return parsed.recettes.map((recipe, index) => ({
    ...recipe,
    id: index + 1,
    image: getRandomImage(index),
    ingredientsUtilises: (recipe.ingredientsUtilises || []).map((ing) => ({
      nom: ing,
      owned: lowerUserIngredients.some(
        (u) => ing.toLowerCase().includes(u) || u.includes(ing.toLowerCase())
      ),
    })),
  }));
};

export default function App() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Ajouter un ingrédient
  const addIngredient = useCallback(() => {
    const val = input.trim().toLowerCase();
    if (val && !ingredients.includes(val)) {
      setIngredients((prev) => [...prev, val]);
      setInput("");
      setError(null);
    }
  }, [input, ingredients]);

  // Supprimer un ingrédient
  const removeIngredient = (item) => {
    setIngredients((prev) => prev.filter((i) => i !== item));
  };

  // Générer les recettes via l'API
  const handleGenerate = async () => {
    if (ingredients.length === 0) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    setRecipes([]);

    // Changer le message de chargement périodiquement
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 2000);

    try {
      const results = await fetchRecipesFromAI(ingredients, ingredients);
      setRecipes(results);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message || "Une erreur est survenue lors de la génération des recettes");
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
    }
  };

  // Ouvrir/Fermer le modal
  const openRecipe = (recipe) => setSelectedRecipe(recipe);
  const closeRecipe = () => setSelectedRecipe(null);

  // Bloquer le scroll quand le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = selectedRecipe ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRecipe]);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeRecipe();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f4", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 30, backgroundColor: "white", borderBottom: "1px solid #e7e5e4", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 768, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #f97316, #e11d48)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)" }}>
            <ChefHat style={{ width: 24, height: 24, color: "white" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1c1917" }}>QuickRecipe</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#78716c" }}>Recettes générées par IA</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 768, margin: "0 auto", padding: "24px 16px" }}>
        {/* Input Section */}
        <div style={{ backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 24, border: "1px solid #e7e5e4", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "#1c1917" }}>
            🥘 Quels ingrédients avez-vous ?
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, color: "#a8a29e", pointerEvents: "none" }} />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addIngredient();
                  }
                }}
                placeholder="Ex: poulet, tomate, oignon..."
                style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 12, borderRadius: 12, border: "1px solid #d6d3d1", backgroundColor: "#fafaf9", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button
              onClick={addIngredient}
              style={{ width: 48, height: 48, borderRadius: 12, border: "1px solid #d6d3d1", backgroundColor: "#f5f5f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7e5e4")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f4")}
            >
              <Plus style={{ width: 20, height: 20, color: "#57534e" }} />
            </button>
          </div>

          {/* Tags d'ingrédients */}
          {ingredients.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {ingredients.map((item) => (
                <span
                  key={item}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 8px 8px 14px", backgroundColor: "#fff7ed", color: "#c2410c", borderRadius: 24, fontSize: 14, fontWeight: 500, border: "1px solid #fed7aa" }}
                >
                  {item}
                  <button
                    onClick={() => removeIngredient(item)}
                    style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fdba74", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <X style={{ width: 12, height: 12, color: "#9a3412" }} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#a8a29e" }}>
              Appuyez sur Entrée ou cliquez sur + pour ajouter un ingrédient
            </p>
          )}

          {/* Bouton Générer */}
          <button
            onClick={handleGenerate}
            disabled={ingredients.length === 0 || loading}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 14,
              border: "none",
              background: ingredients.length > 0 && !loading ? "linear-gradient(135deg, #f97316, #e11d48)" : "#d6d3d1",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: ingredients.length > 0 && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: ingredients.length > 0 && !loading ? "0 4px 14px rgba(249, 115, 22, 0.35)" : "none",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <Loader2 style={{ width: 22, height: 22, animation: "spin 1s linear infinite" }} />
            ) : (
              <Sparkles style={{ width: 22, height: 22 }} />
            )}
            {loading ? "Génération en cours..." : "Générer des recettes avec l'IA"}
          </button>
        </div>

        {/* États : Chargement, Erreur, Résultats */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 80, height: 80, margin: "0 auto 20px", borderRadius: 20, background: "linear-gradient(135deg, #fff7ed, #fef3c7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChefHat style={{ width: 40, height: 40, color: "#f97316", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: "#1c1917" }}>{loadingMessage}</p>
            <p style={{ margin: 0, fontSize: 14, color: "#78716c" }}>Cela peut prendre quelques secondes...</p>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#f97316",
                    animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: "#fef2f2", borderRadius: 16, border: "1px solid #fecaca" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: 16, backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle style={{ width: 32, height: 32, color: "#dc2626" }} />
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#991b1b" }}>Oups ! Une erreur est survenue</p>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#b91c1c", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>{error}</p>
            <button
              onClick={handleGenerate}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, border: "none", backgroundColor: "#dc2626", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              <RefreshCw style={{ width: 18, height: 18 }} />
              Réessayer
            </button>
          </div>
        ) : searched && recipes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: 16, backgroundColor: "#f5f5f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UtensilsCrossed style={{ width: 32, height: 32, color: "#a8a29e" }} />
            </div>
            <p style={{ margin: "0 0 8px", fontWeight: 600, color: "#57534e" }}>Aucune recette trouvée</p>
            <p style={{ margin: 0, fontSize: 14, color: "#a8a29e" }}>Essayez avec d'autres ingrédients</p>
          </div>
        ) : recipes.length > 0 ? (
          <div>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600, color: "#1c1917" }}>
              ✨ {recipes.length} recette{recipes.length > 1 ? "s" : ""} générée{recipes.length > 1 ? "s" : ""} par l'IA
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {recipes.map((recipe, index) => (
                <RecipeCard key={recipe.id || index} recipe={recipe} index={index} onClick={() => openRecipe(recipe)} />
              ))}
            </div>
          </div>
        ) : null}
      </main>

      {/* Modal */}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={closeRecipe} userIngredients={ingredients} />
      )}

      {/* Animations CSS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-12px); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        input:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
      `}</style>
    </div>
  );
}

// Composant Carte de Recette
function RecipeCard({ recipe, index, onClick }) {
  const ownedCount = recipe.ingredientsUtilises?.filter((i) => i.owned).length || 0;
  const totalCount = (recipe.ingredientsUtilises?.length || 0) + (recipe.ingredientsManquants?.length || 0);
  const percentage = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: "white", borderRadius: 16, overflow: "hidden", border: "1px solid #e7e5e4", cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.12)";
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "#fdba74";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "#e7e5e4";
      }}
    >
      <div style={{ position: "relative", height: 160 }}>
        <img
          src={recipe.image || getRandomImage(index)}
          alt={recipe.titre}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.src = getRandomImage(index); }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent 60%)" }} />
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: "5px 12px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            color: "white",
            backgroundColor: recipe.difficulte === "Facile" ? "#10b981" : recipe.difficulte === "Moyen" ? "#f59e0b" : "#ef4444",
          }}
        >
          {recipe.difficulte || "Moyen"}
        </span>
        <h3 style={{ position: "absolute", bottom: 12, left: 14, right: 14, margin: 0, fontSize: 17, fontWeight: 700, color: "white", lineHeight: 1.3 }}>
          {recipe.titre}
        </h3>
      </div>
      <div style={{ padding: 14 }}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#78716c", lineHeight: 1.4 }}>
          {recipe.description || "Une délicieuse recette à découvrir"}
        </p>
        <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#57534e", marginBottom: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Clock style={{ width: 14, height: 14, color: "#78716c" }} />
            {(recipe.tempsPreparation || 0) + (recipe.tempsCuisson || 0)} min
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Flame style={{ width: 14, height: 14, color: "#f97316" }} />
            {recipe.calories || "N/A"} kcal
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Users style={{ width: 14, height: 14, color: "#78716c" }} />
            {recipe.portions || 4}
          </span>
        </div>
        <div style={{ height: 6, backgroundColor: "#f5f5f4", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #f97316, #fb923c)", borderRadius: 3, width: `${percentage}%`, transition: "width 0.3s" }} />
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 11, color: "#a8a29e" }}>
          {ownedCount}/{totalCount} ingrédients disponibles
        </p>
      </div>
    </div>
  );
}

// Composant Modal de Recette
function RecipeModal({ recipe, onClose, userIngredients }) {
  const lowerUserIngredients = userIngredients.map((i) => i.toLowerCase());

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 640,
          maxHeight: "85vh",
          backgroundColor: "white",
          borderRadius: 24,
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)")}
        >
          <X style={{ width: 22, height: 22, color: "white" }} />
        </button>

        {/* Image Header */}
        <div style={{ position: "relative", height: 200, flexShrink: 0 }}>
          <img
            src={recipe.image || getRandomImage(recipe.id || 0)}
            alt={recipe.titre}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.src = getRandomImage(0); }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
            <span
              style={{
                display: "inline-block",
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: "white",
                backgroundColor: recipe.difficulte === "Facile" ? "#10b981" : recipe.difficulte === "Moyen" ? "#f59e0b" : "#ef4444",
                marginBottom: 10,
              }}
            >
              {recipe.difficulte || "Moyen"}
            </span>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "white", lineHeight: 1.2 }}>{recipe.titre}</h2>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{recipe.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "14px 10px", borderBottom: "1px solid #f5f5f4", backgroundColor: "#fafaf9", flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#1c1917" }}>{recipe.tempsPreparation || 15}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#78716c" }}>min prépa</p>
          </div>
          <div style={{ width: 1, backgroundColor: "#e7e5e4" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#1c1917" }}>{recipe.tempsCuisson || 30}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#78716c" }}>min cuisson</p>
          </div>
          <div style={{ width: 1, backgroundColor: "#e7e5e4" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#f97316" }}>{recipe.calories || "N/A"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#78716c" }}>kcal</p>
          </div>
          <div style={{ width: 1, backgroundColor: "#e7e5e4" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#1c1917" }}>{recipe.portions || 4}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#78716c" }}>portions</p>
          </div>
        </div>

        {/* Contenu Scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {/* Ingrédients Manquants */}
          {recipe.ingredientsManquants && recipe.ingredientsManquants.length > 0 && (
            <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <AlertCircle style={{ width: 18, height: 18, color: "#d97706" }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: "#92400e" }}>Ingrédients à acheter</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {recipe.ingredientsManquants.map((ing, i) => (
                  <span key={i} style={{ padding: "6px 12px", backgroundColor: "white", border: "1px solid #fde68a", borderRadius: 20, fontSize: 13, color: "#92400e" }}>
                    {ing.nom} {ing.quantite && `• ${ing.quantite}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vos Ingrédients */}
          {recipe.ingredientsUtilises && recipe.ingredientsUtilises.filter((i) => i.owned).length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Check style={{ width: 18, height: 18, color: "#10b981" }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: "#1c1917" }}>Vos ingrédients</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {recipe.ingredientsUtilises.filter((i) => i.owned).map((ing, i) => (
                  <span key={i} style={{ padding: "6px 12px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 20, fontSize: 13, color: "#065f46" }}>
                    {ing.nom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#1c1917" }}>📝 Instructions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(recipe.etapes || []).map((step, idx) => (
                <div key={idx} style={{ display: "flex", gap: 14, padding: 14, backgroundColor: "#fafaf9", borderRadius: 14, border: "1px solid #f5f5f4" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: "linear-gradient(135deg, #f97316, #e11d48)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {step.numero || idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#1c1917", lineHeight: 1.5 }}>{step.instruction}</p>
                    <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#78716c" }}>
                      {step.duree && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock style={{ width: 14, height: 14 }} />
                          {step.duree}
                        </span>
                      )}
                      {step.temperature && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f97316" }}>
                          <ThermometerSun style={{ width: 14, height: 14 }} />
                          {step.temperature}°C
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: 16, borderTop: "1px solid #f5f5f4", backgroundColor: "#fafaf9", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 14,
              border: "none",
              backgroundColor: "#1c1917",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#292524")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1c1917")}
          >
            Fermer la recette
          </button>
        </div>
      </div>
    </div>
  );
}
