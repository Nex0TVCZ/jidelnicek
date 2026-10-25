// ===== Najdeme si prvky na stránce =====
const form = document.getElementById("bmi-form");
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const errorBox = document.getElementById("error");
const resultBox = document.getElementById("result");
const bmiValue = document.getElementById("bmi-value");
const bmiCategory = document.getElementById("bmi-category");
const bmiText = document.getElementById("bmi-text");

// Klíč, pod kterým si hodnoty uložíme v prohlížeči
const STORAGE_KEY = "jidelnicek-bmi";

// ===== Kategorie BMI (podle WHO) =====
const CATEGORIES = [
  {
    max: 18.5,
    name: "Podváha",
    cssClass: "cat-podvaha",
    text: "Vaše váha je nižší, než je pro vaši výšku zdravé. Zkuste jíst pestře a dostatečně.",
  },
  {
    max: 25,
    name: "Norma",
    cssClass: "cat-norma",
    text: "Skvělé! Vaše váha je v pásmu zdravé váhy. Pokračujte ve vyvážené stravě a pohybu.",
  },
  {
    max: 30,
    name: "Nadváha",
    cssClass: "cat-nadvaha",
    text: "Vaše váha je mírně nad zdravým pásmem. Pomůže více pohybu a menší porce.",
  },
  {
    max: Infinity,
    name: "Obezita",
    cssClass: "cat-obezita",
    text: "Vaše váha je výrazně nad zdravým pásmem. Doporučujeme poradit se s lékařem.",
  },
];

// Spočítá BMI: váha (kg) / výška (m) na druhou
function calculateBmi(heightCm, weightKg) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// Najde kategorii, do které BMI patří
function getCategory(bmi) {
  return CATEGORIES.find((category) => bmi < category.max);
}

// Zobrazí výsledek na stránce
function showResult(heightCm, weightKg) {
  // Zaokrouhlíme na 1 desetinné místo, aby barva odpovídala zobrazenému číslu
  const bmi = Math.round(calculateBmi(heightCm, weightKg) * 10) / 10;
  const category = getCategory(bmi);

  // České formátování čísla (desetinná čárka), např. 22,9
  bmiValue.textContent = bmi.toLocaleString("cs-CZ", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  bmiCategory.textContent = category.name;
  bmiText.textContent = category.text;

  // Nastavíme barvu podle kategorie
  resultBox.className = "card result " + category.cssClass;
  resultBox.hidden = false;
}

// Zkontroluje, jestli jsou zadané hodnoty rozumné. Vrací text chyby, nebo null.
function validate(heightCm, weightKg) {
  if (!heightCm || !weightKg) {
    return "Vyplňte prosím výšku i váhu.";
  }
  if (heightCm < 50 || heightCm > 250) {
    return "Výška musí být mezi 50 a 250 cm.";
  }
  if (weightKg < 20 || weightKg > 300) {
    return "Váha musí být mezi 20 a 300 kg.";
  }
  return null;
}

// Uloží hodnoty do prohlížeče (localStorage)
function saveValues(heightCm, weightKg) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ height: heightCm, weight: weightKg }));
  } catch (e) {
    // Pokud prohlížeč ukládání nepovolí (např. anonymní okno), nic se neděje
  }
}

// Načte uložené hodnoty z prohlížeče
function loadValues() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.height && saved.weight) {
      return saved;
    }
  } catch (e) {
    // Uložená data chybí nebo jsou poškozená
  }
  return null;
}

// ===== Co se stane po kliknutí na "Spočítat" =====
form.addEventListener("submit", (event) => {
  event.preventDefault(); // zabrání znovunačtení stránky

  const heightCm = parseFloat(heightInput.value);
  const weightKg = parseFloat(weightInput.value);

  const error = validate(heightCm, weightKg);
  if (error) {
    errorBox.textContent = error;
    errorBox.hidden = false;
    resultBox.hidden = true;
    return;
  }

  errorBox.hidden = true;
  saveValues(heightCm, weightKg);
  showResult(heightCm, weightKg);
});

// ===== Po otevření stránky vyplníme uložené hodnoty =====
const saved = loadValues();
if (saved) {
  heightInput.value = saved.height;
  weightInput.value = saved.weight;
  if (!validate(saved.height, saved.weight)) {
    showResult(saved.height, saved.weight);
  }
}
