export type SkillCategory = 'languages' | 'ai-ml' | 'backend' | 'frontend';
export type ProficiencyTier = 'daily' | 'comfortable' | 'exploring';

export interface SkillNode {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyTier;
  emoji: string;
  description: string;
  val: number;
  fx?: number;  // initial x position (brain region placement)
  fy?: number;  // initial y position (brain region placement)
}

export interface SkillLink {
  source: string;
  target: string;
}

export const categoryColors: Record<SkillCategory, string> = {
  languages: '#0ea5e9',
  'ai-ml': '#a855f7',
  backend: '#22c55e',
  frontend: '#f97316',
};

export const categoryLabels: Record<SkillCategory, string> = {
  languages: 'Languages',
  'ai-ml': 'AI & ML',
  backend: 'Systems & Infra',
  frontend: 'Frontend & Viz',
};

export const tierLabels: Record<ProficiencyTier, string> = {
  daily: 'Daily Driver',
  comfortable: 'Comfortable',
  exploring: 'Exploring',
};

export const tierColors: Record<ProficiencyTier, string> = {
  daily: '#0ea5e9',
  comfortable: '#a855f7',
  exploring: '#22c55e',
};

export const skillNodes: SkillNode[] = [
  // === Languages === (Left hemisphere — analytical/logical)
  { id: 'python', name: 'Python', category: 'languages', proficiency: 'daily', emoji: '🐍', description: 'Primary language for everything. 10K+ lines across Axiom Engine, ML pipelines, and automation scripts.', val: 8, fx: -160, fy: -20 },
  { id: 'javascript', name: 'JavaScript', category: 'languages', proficiency: 'daily', emoji: '⚡', description: 'Frontend and visualization work. Three.js simulations, GSAP animations, full interactive UIs.', val: 7, fx: -120, fy: 20 },
  { id: 'typescript', name: 'TypeScript', category: 'languages', proficiency: 'comfortable', emoji: '🔷', description: 'Type-safe development. This portfolio is built in TypeScript with Astro and React.', val: 5, fx: -100, fy: 60 },
  { id: 'html-css', name: 'HTML/CSS', category: 'languages', proficiency: 'daily', emoji: '🎨', description: 'Semantic markup, responsive layouts, CSS animations. This portfolio is hand-built, no templates.', val: 5, fx: -80, fy: 90 },
  { id: 'sql', name: 'SQL', category: 'languages', proficiency: 'comfortable', emoji: '🗄️', description: 'Database design and queries. SQLite WAL mode for Axiom — 10 tables, auto-migration, complex joins.', val: 5, fx: -180, fy: 40 },
  { id: 'rust', name: 'Rust', category: 'languages', proficiency: 'comfortable', emoji: '🦀', description: 'Systems-level work. Learning to build performant, memory-safe tooling and CLI applications.', val: 5, fx: -200, fy: 80 },
  { id: 'c-cpp', name: 'C/C++', category: 'languages', proficiency: 'exploring', emoji: '⚙️', description: 'Computer Systems coursework. Memory management, pointers, low-level systems programming at Northwestern.', val: 5, fx: -180, fy: 110 },

  // === AI & ML === (Top/Prefrontal — higher-order thinking)
  { id: 'langchain', name: 'LangChain', category: 'ai-ml', proficiency: 'comfortable', emoji: '🔗', description: "Orchestration layer for Axiom's AI generation — chains, prompts, document loaders, FAISS integration.", val: 5, fx: -50, fy: -100 },
  { id: 'faiss', name: 'FAISS', category: 'ai-ml', proficiency: 'comfortable', emoji: '🔍', description: "Vector similarity search for Axiom's RAG pipeline. 768-dim embeddings via gemini-embedding-001, cosine similarity.", val: 4, fx: 50, fy: -90 },
  { id: 'pytorch', name: 'PyTorch', category: 'ai-ml', proficiency: 'comfortable', emoji: '🔥', description: 'Neural network training and experimentation. Built the ML Autocomplete model from scratch.', val: 5, fx: -90, fy: -65 },
  { id: 'rag', name: 'RAG Pipelines', category: 'ai-ml', proficiency: 'comfortable', emoji: '📚', description: 'Document ingestion, chunking, embedding, retrieval, and context assembly. 41 phrase-based intent triggers for smart routing.', val: 4, fx: 80, fy: -70 },
  { id: 'prompt-eng', name: 'Prompt Engineering', category: 'ai-ml', proficiency: 'comfortable', emoji: '✍️', description: "196-line Mermaid Syntax Firewall, few-shot examples, persona tuning. Axiom's three personas each have calibrated prompt strategies.", val: 3, fx: 0, fy: -130 },
  { id: 'gemini', name: 'Gemini API', category: 'ai-ml', proficiency: 'comfortable', emoji: '🧠', description: 'Google Gemini 2.5 Pro integration with streaming generation, embedding API, error handling, and token management.', val: 4, fx: 0, fy: -85 },
  { id: 'scikit', name: 'scikit-learn', category: 'ai-ml', proficiency: 'exploring', emoji: '📊', description: 'Classical ML algorithms. Classification, regression, clustering for coursework and data analysis.', val: 3, fx: -65, fy: -40 },
  { id: 'nlp', name: 'NLP', category: 'ai-ml', proficiency: 'exploring', emoji: '💬', description: 'Tokenization, n-grams, embeddings, contextual analysis. Built ML Autocomplete using NLTK and spaCy.', val: 3, fx: 65, fy: -45 },
  { id: 'embeddings', name: 'Embeddings', category: 'ai-ml', proficiency: 'exploring', emoji: '🧮', description: 'Vector representations of text. Used in FAISS indexing, semantic search, and similarity scoring.', val: 3, fx: 30, fy: -115 },

  // === Systems & Infrastructure === (Left hemisphere — lower, logical)
  { id: 'flask', name: 'Flask', category: 'backend', proficiency: 'daily', emoji: '🧪', description: "Built Axiom's 31-endpoint API across 8 blueprints. REST design, middleware, streaming SSE responses.", val: 5, fx: -140, fy: 60 },
  { id: 'rest', name: 'REST APIs', category: 'backend', proficiency: 'daily', emoji: '🌐', description: 'API design, versioning, error handling. Axiom has 31 endpoints across 8 resource domains with rate limiting.', val: 4, fx: -160, fy: 95 },
  { id: 'docker', name: 'Docker', category: 'backend', proficiency: 'daily', emoji: '🐳', description: 'Containerized Axiom for reproducible deploys. Multi-stage builds, compose files, non-root user, healthchecks.', val: 4, fx: -120, fy: 110 },
  { id: 'git', name: 'Git', category: 'backend', proficiency: 'daily', emoji: '📦', description: 'Daily driver. Feature branches, rebasing, conflict resolution across every project.', val: 4, fx: -200, fy: 130 },
  { id: 'linux', name: 'Linux', category: 'backend', proficiency: 'daily', emoji: '🐧', description: 'Primary dev environment. Shell scripting, process management, server administration.', val: 4, fx: -160, fy: 135 },
  { id: 'sqlite', name: 'SQLite', category: 'backend', proficiency: 'comfortable', emoji: '💾', description: "Axiom's persistence layer. WAL mode, 10 tables, auto-migration, schema evolution on startup.", val: 3, fx: -140, fy: 85 },
  { id: 'pytest', name: 'pytest', category: 'backend', proficiency: 'comfortable', emoji: '✅', description: '219 tests across 10 modules for Axiom. Fixtures, parametrization, mocking, coverage reporting.', val: 3, fx: -100, fy: 130 },
  { id: 'gh-actions', name: 'GitHub Actions', category: 'backend', proficiency: 'comfortable', emoji: '🔄', description: 'CI/CD pipelines. Automated testing (ruff + pytest), linting, Docker builds.', val: 3, fx: -185, fy: 150 },

  // === Frontend & Visualization === (Right hemisphere — creative/visual)
  { id: 'react', name: 'React', category: 'frontend', proficiency: 'comfortable', emoji: '⚛️', description: 'Component-driven UIs. This portfolio uses React 19 islands within Astro for interactive features.', val: 5, fx: 110, fy: 15 },
  { id: 'astro', name: 'Astro', category: 'frontend', proficiency: 'comfortable', emoji: '🚀', description: 'Modern static-site framework. This portfolio is Astro 5 with content collections, MDX, and island architecture.', val: 4, fx: 150, fy: 55 },
  { id: 'threejs', name: 'Three.js', category: 'frontend', proficiency: 'comfortable', emoji: '🎮', description: "3D visualization for Axiom's 3,000+ particle neural background and the Slime Mold GPU simulation.", val: 5, fx: 170, fy: 25 },
  { id: 'gsap', name: 'GSAP', category: 'frontend', proficiency: 'comfortable', emoji: '🎬', description: 'Animation library powering this portfolio. ScrollTrigger, timelines, staggered reveals.', val: 4, fx: 130, fy: 80 },
  { id: 'webgl', name: 'WebGL', category: 'frontend', proficiency: 'exploring', emoji: '🖼️', description: 'GPU-accelerated rendering. Custom GLSL shaders for the Slime Mold simulation — 100K+ agents at 60fps.', val: 4, fx: 190, fy: 65 },
  { id: 'autocad', name: 'AutoCAD', category: 'frontend', proficiency: 'exploring', emoji: '📐', description: 'CAD modeling for the Vestibular Rehab Device. Parametric design, technical drawings.', val: 3, fx: 200, fy: 110 },
];

export const skillLinks: SkillLink[] = [
  // Python ecosystem
  { source: 'python', target: 'flask' },
  { source: 'python', target: 'pytorch' },
  { source: 'python', target: 'langchain' },
  { source: 'python', target: 'scikit' },
  { source: 'python', target: 'pytest' },
  { source: 'flask', target: 'rest' },
  { source: 'flask', target: 'sqlite' },
  { source: 'flask', target: 'docker' },

  // AI chain
  { source: 'langchain', target: 'faiss' },
  { source: 'langchain', target: 'rag' },
  { source: 'langchain', target: 'prompt-eng' },
  { source: 'langchain', target: 'gemini' },
  { source: 'faiss', target: 'embeddings' },
  { source: 'pytorch', target: 'nlp' },
  { source: 'nlp', target: 'embeddings' },
  { source: 'rag', target: 'faiss' },
  { source: 'scikit', target: 'nlp' },
  { source: 'gemini', target: 'rag' },

  // JavaScript/TypeScript ecosystem
  { source: 'javascript', target: 'typescript' },
  { source: 'javascript', target: 'threejs' },
  { source: 'javascript', target: 'gsap' },
  { source: 'typescript', target: 'react' },
  { source: 'typescript', target: 'astro' },
  { source: 'react', target: 'astro' },
  { source: 'threejs', target: 'webgl' },
  { source: 'html-css', target: 'javascript' },
  { source: 'html-css', target: 'astro' },

  // Backend
  { source: 'sql', target: 'sqlite' },
  { source: 'git', target: 'gh-actions' },
  { source: 'docker', target: 'linux' },

  // Systems
  { source: 'c-cpp', target: 'rust' },
  { source: 'c-cpp', target: 'linux' },
];
