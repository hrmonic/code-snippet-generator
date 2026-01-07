import axios from 'axios';
import type { GenerateRequest, GenerateResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes de timeout
});

// Mode démo avec snippets statiques (fallback si API indisponible)
const DEMO_SNIPPETS: Record<string, Record<string, string>> = {
  html5: {
    form: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulaire</title>
</head>
<body>
    <form action="/submit" method="POST" novalidate>
        <div class="form-group">
            <label for="name">Nom</label>
            <input type="text" id="name" name="name" required minlength="2" maxlength="50">
        </div>
        
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
        </div>
        
        <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="5" required></textarea>
        </div>
        
        <button type="submit">Envoyer</button>
    </form>
</body>
</html>`,
    input: `<div class="form-container">
    <input type="text" placeholder="Texte" required>
    <input type="email" placeholder="Email" required>
    <input type="tel" placeholder="Téléphone">
    <input type="url" placeholder="URL">
    <input type="number" placeholder="Nombre" min="0" max="100">
    <input type="date" placeholder="Date">
    <input type="time" placeholder="Heure">
    <input type="datetime-local" placeholder="Date et heure">
    <input type="color" placeholder="Couleur">
    <input type="range" min="0" max="100" value="50">
    <input type="search" placeholder="Recherche">
    <input type="password" placeholder="Mot de passe" required>
</div>`,
    layout: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ma Page</title>
</head>
<body>
    <header>
        <h1>Ma Page</h1>
    </header>
    <main>
        <section>
            <h2>Contenu principal</h2>
            <p>Structure HTML responsive</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 Mon Entreprise</p>
    </footer>
</body>
</html>`,
  },
  css3: {
    animation: `@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideIn {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(0);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.fade-in {
    animation: fadeIn 0.5s ease-in-out;
}

.slide-in {
    animation: slideIn 0.3s ease-out;
}

.pulse {
    animation: pulse 2s infinite;
}`,
    layout: `.container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}

.flex-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

@media (max-width: 768px) {
    .container {
        grid-template-columns: 1fr;
    }
}`,
  },
  javascript: {
    api: `class ApiClient {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = \`\${this.baseURL}\${endpoint}\`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Utilisation
const api = new ApiClient('http://localhost:3000/api');
const data = await api.get('/api/users');`,
    validation: `function validateForm(formData) {
    const errors = {};
    
    if (!formData.email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
        errors.email = 'Email invalide';
    }
    
    if (!formData.password || formData.password.length < 8) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}`,
    animation: `function animateElement(element, duration = 1000) {
    const start = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.transform = \`translateY(\${progress * 100}px)\`;
        element.style.opacity = progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}`,
  },
};

function applyTemplateVariables(code: string, options: Record<string, unknown>): string {
  let result = code;
  for (const [key, value] of Object.entries(options)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, String(value));
  }
  return result;
}

async function generateCodeDemo(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const demoCode = DEMO_SNIPPETS[request.language]?.[request.feature];
  
  if (!demoCode) {
    throw new Error(
      `Snippet démo non disponible pour ${request.language} / ${request.feature}`
    );
  }

  const code = applyTemplateVariables(demoCode, request.options);
  
  const extensions: Record<string, string> = {
    html5: 'html',
    css3: 'css',
    javascript: 'js',
    java: 'java',
    php: 'php',
    sql: 'sql',
  };

  return {
    code,
    filename: `code.${extensions[request.language] || 'txt'}`,
    language: request.language,
  };
}

export async function generateCode(
  request: GenerateRequest
): Promise<GenerateResponse> {
  try {
    const response = await api.post<GenerateResponse>('/api/generate', request);
    return response.data;
  } catch (error) {
    // Si l'API n'est pas disponible, utiliser le mode démo
    if (axios.isAxiosError(error) && (!error.response || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK')) {
      console.warn('API non disponible, utilisation du mode démo');
      return generateCodeDemo(request);
    }
    
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Erreur lors de la génération du code'
      );
    }
    throw error;
  }
}

export async function getAvailableSnippets() {
  try {
    const response = await api.get('/api/snippets');
    return response.data;
  } catch (error) {
    // Si l'API n'est pas disponible, retourner les snippets démo
    if (axios.isAxiosError(error) && (!error.response || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK')) {
      console.warn('API non disponible, utilisation des snippets démo');
      const demoList = [];
      for (const [lang, features] of Object.entries(DEMO_SNIPPETS)) {
        for (const feature of Object.keys(features)) {
          demoList.push({ id: `${lang}-${feature}`, language: lang, feature });
        }
      }
      return demoList;
    }
    
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Erreur lors de la récupération des snippets'
      );
    }
    throw error;
  }
}
