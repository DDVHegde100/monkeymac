import type { Theme } from './types'

export const THEMES: Theme[] = [
  // Original MonkeyType inspired themes
  { id: 'dark', name: 'Dark (Default)', colors: { primary: '#1a1a1a', secondary: '#2a2a2a', accent: '#ffd700', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#b8b8b8' }},
  { id: 'light', name: 'Light', colors: { primary: '#ffffff', secondary: '#f5f5f5', accent: '#0066cc', correct: '#00aa00', incorrect: '#cc0000', textPrimary: '#000000', textSecondary: '#666666' }},
  { id: 'serika', name: 'Serika', colors: { primary: '#323437', secondary: '#2c2e31', accent: '#e2b714', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#d1d0c5', textSecondary: '#646669' }},
  { id: 'metropolis', name: 'Metropolis', colors: { primary: '#1e1e1e', secondary: '#2d2d2d', accent: '#fc7753', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#a0a0a0' }},
  { id: 'laser', name: 'Laser', colors: { primary: '#031926', secondary: '#0b2137', accent: '#00ff00', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#7dd3fc' }},
  { id: 'botanical', name: 'Botanical', colors: { primary: '#283618', secondary: '#1a2409', accent: '#bc6c25', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#fefae0', textSecondary: '#dda15e' }},
  { id: 'vaporwave', name: 'Vaporwave', colors: { primary: '#0d0221', secondary: '#1a0b3d', accent: '#ff00ff', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ff00ff', textSecondary: '#8a2be2' }},
  { id: 'dracula', name: 'Dracula', colors: { primary: '#282a36', secondary: '#44475a', accent: '#ff79c6', correct: '#50fa7b', incorrect: '#ff5555', textPrimary: '#f8f8f2', textSecondary: '#6272a4' }},
  { id: 'monokai', name: 'Monokai', colors: { primary: '#272822', secondary: '#383830', accent: '#a6e22e', correct: '#a6e22e', incorrect: '#f92672', textPrimary: '#f8f8f2', textSecondary: '#75715e' }},
  { id: 'nord', name: 'Nord', colors: { primary: '#2e3440', secondary: '#3b4252', accent: '#88c0d0', correct: '#a3be8c', incorrect: '#bf616a', textPrimary: '#eceff4', textSecondary: '#d8dee9' }},
  { id: 'gruvbox', name: 'Gruvbox', colors: { primary: '#282828', secondary: '#3c3836', accent: '#fabd2f', correct: '#b8bb26', incorrect: '#fb4934', textPrimary: '#ebdbb2', textSecondary: '#a89984' }},
  { id: 'terminal', name: 'Terminal', colors: { primary: '#000000', secondary: '#1a1a1a', accent: '#00ff00', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#00ff00', textSecondary: '#008000' }},
  
  // Extended color palette
  { id: 'ocean', name: 'Ocean', colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#06b6d4', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#f1f5f9', textSecondary: '#64748b' }},
  { id: 'sunset', name: 'Sunset', colors: { primary: '#7c2d12', secondary: '#9a3412', accent: '#fb923c', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#fed7aa', textSecondary: '#fdba74' }},
  { id: 'forest', name: 'Forest', colors: { primary: '#052e16', secondary: '#166534', accent: '#4ade80', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#bbf7d0', textSecondary: '#86efac' }},
  { id: 'cherry', name: 'Cherry', colors: { primary: '#4c0519', secondary: '#7f1d3e', accent: '#f43f5e', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#fecaca', textSecondary: '#f87171' }},
  { id: 'grape', name: 'Grape', colors: { primary: '#2e1065', secondary: '#4c1d95', accent: '#8b5cf6', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#ddd6fe', textSecondary: '#c4b5fd' }},
  { id: 'mint', name: 'Mint', colors: { primary: '#022c22', secondary: '#065f46', accent: '#34d399', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#a7f3d0', textSecondary: '#6ee7b7' }},
  { id: 'coral', name: 'Coral', colors: { primary: '#7c2d12', secondary: '#c2410c', accent: '#ff7849', correct: '#10b981', incorrect: '#dc2626', textPrimary: '#fed7aa', textSecondary: '#fdba74' }},
  { id: 'slate', name: 'Slate', colors: { primary: '#0f172a', secondary: '#334155', accent: '#64748b', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#f1f5f9', textSecondary: '#94a3b8' }},
  { id: 'amber', name: 'Amber', colors: { primary: '#451a03', secondary: '#78350f', accent: '#f59e0b', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#fef3c7', textSecondary: '#fcd34d' }},
  
  // Neon themes
  { id: 'neon-blue', name: 'Neon Blue', colors: { primary: '#0a0a0a', secondary: '#1a1a2e', accent: '#00ffff', correct: '#00ff00', incorrect: '#ff0040', textPrimary: '#00ffff', textSecondary: '#0077ff' }},
  { id: 'neon-pink', name: 'Neon Pink', colors: { primary: '#0a0a0a', secondary: '#2a0a2a', accent: '#ff0080', correct: '#00ff00', incorrect: '#ff0040', textPrimary: '#ff0080', textSecondary: '#ff40a0' }},
  { id: 'neon-green', name: 'Neon Green', colors: { primary: '#0a0a0a', secondary: '#0a2a0a', accent: '#00ff40', correct: '#00ff80', incorrect: '#ff0040', textPrimary: '#00ff40', textSecondary: '#80ff80' }},
  { id: 'neon-purple', name: 'Neon Purple', colors: { primary: '#0a0a0a', secondary: '#1a0a2a', accent: '#8000ff', correct: '#00ff00', incorrect: '#ff0040', textPrimary: '#8000ff', textSecondary: '#a040ff' }},
  { id: 'neon-orange', name: 'Neon Orange', colors: { primary: '#0a0a0a', secondary: '#2a1a0a', accent: '#ff8000', correct: '#00ff00', incorrect: '#ff0040', textPrimary: '#ff8000', textSecondary: '#ffa040' }},
  
  // Pastel themes
  { id: 'pastel-pink', name: 'Pastel Pink', colors: { primary: '#fdf2f8', secondary: '#fce7f3', accent: '#ec4899', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#831843', textSecondary: '#be185d' }},
  { id: 'pastel-blue', name: 'Pastel Blue', colors: { primary: '#eff6ff', secondary: '#dbeafe', accent: '#3b82f6', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#1e40af', textSecondary: '#3b82f6' }},
  { id: 'pastel-green', name: 'Pastel Green', colors: { primary: '#f0fdf4', secondary: '#dcfce7', accent: '#22c55e', correct: '#16a34a', incorrect: '#ef4444', textPrimary: '#166534', textSecondary: '#22c55e' }},
  { id: 'pastel-purple', name: 'Pastel Purple', colors: { primary: '#faf5ff', secondary: '#f3e8ff', accent: '#a855f7', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#6b21a8', textSecondary: '#9333ea' }},
  { id: 'pastel-yellow', name: 'Pastel Yellow', colors: { primary: '#fefce8', secondary: '#fef3c7', accent: '#eab308', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#a16207', textSecondary: '#ca8a04' }},
  
  // Cyberpunk themes
  { id: 'cyberpunk', name: 'Cyberpunk', colors: { primary: '#0d1117', secondary: '#21262d', accent: '#ff007f', correct: '#00ff41', incorrect: '#ff0040', textPrimary: '#00ffff', textSecondary: '#7c3aed' }},
  { id: 'matrix', name: 'Matrix', colors: { primary: '#000000', secondary: '#001100', accent: '#00ff00', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#00ff00', textSecondary: '#008800' }},
  { id: 'synthwave', name: 'Synthwave', colors: { primary: '#1a0933', secondary: '#2d1b69', accent: '#ff006e', correct: '#00f5ff', incorrect: '#ff0040', textPrimary: '#f72585', textSecondary: '#7209b7' }},
  { id: 'retrowave', name: 'Retrowave', colors: { primary: '#240046', secondary: '#3c096c', accent: '#ff0080', correct: '#00ffff', incorrect: '#ff4000', textPrimary: '#ff006e', textSecondary: '#c77dff' }},
  { id: 'outrun', name: 'Outrun', colors: { primary: '#0f0f23', secondary: '#1a1a3e', accent: '#fc1460', correct: '#0abdc6', incorrect: '#ff4000', textPrimary: '#fc1460', textSecondary: '#0abdc6' }},
  
  // Nature themes
  { id: 'sunrise', name: 'Sunrise', colors: { primary: '#451a03', secondary: '#7c2d12', accent: '#fb923c', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#fed7aa', textSecondary: '#fbbf24' }},
  { id: 'aurora', name: 'Aurora', colors: { primary: '#0c4a6e', secondary: '#075985', accent: '#38bdf8', correct: '#34d399', incorrect: '#f87171', textPrimary: '#bae6fd', textSecondary: '#7dd3fc' }},
  { id: 'volcano', name: 'Volcano', colors: { primary: '#7c1d1d', secondary: '#991b1b', accent: '#ef4444', correct: '#22c55e', incorrect: '#b91c1c', textPrimary: '#fecaca', textSecondary: '#f87171' }},
  { id: 'desert', name: 'Desert', colors: { primary: '#78350f', secondary: '#92400e', accent: '#f59e0b', correct: '#10b981', incorrect: '#dc2626', textPrimary: '#fcd34d', textSecondary: '#f59e0b' }},
  { id: 'glacial', name: 'Glacial', colors: { primary: '#164e63', secondary: '#0e7490', accent: '#06b6d4', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#a5f3fc', textSecondary: '#67e8f9' }},
  
  // Vintage themes
  { id: 'sepia', name: 'Sepia', colors: { primary: '#3f2f1f', secondary: '#5d4037', accent: '#d4af37', correct: '#8bc34a', incorrect: '#d32f2f', textPrimary: '#f5e6d3', textSecondary: '#d7b899' }},
  { id: 'typewriter', name: 'Typewriter', colors: { primary: '#2e2e2e', secondary: '#3e3e3e', accent: '#c9b037', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#e0e0e0', textSecondary: '#b0b0b0' }},
  { id: 'parchment', name: 'Parchment', colors: { primary: '#f5f5dc', secondary: '#f0e68c', accent: '#8b4513', correct: '#228b22', incorrect: '#dc143c', textPrimary: '#2f1b14', textSecondary: '#8b4513' }},
  { id: 'newspaper', name: 'Newspaper', colors: { primary: '#f8f8f8', secondary: '#e8e8e8', accent: '#000080', correct: '#008000', incorrect: '#800000', textPrimary: '#1a1a1a', textSecondary: '#666666' }},
  
  // Minimal themes
  { id: 'minimal-dark', name: 'Minimal Dark', colors: { primary: '#111111', secondary: '#222222', accent: '#ffffff', correct: '#888888', incorrect: '#444444', textPrimary: '#ffffff', textSecondary: '#888888' }},
  { id: 'minimal-light', name: 'Minimal Light', colors: { primary: '#ffffff', secondary: '#f0f0f0', accent: '#000000', correct: '#666666', incorrect: '#999999', textPrimary: '#000000', textSecondary: '#666666' }},
  { id: 'monochrome', name: 'Monochrome', colors: { primary: '#1a1a1a', secondary: '#2a2a2a', accent: '#ffffff', correct: '#cccccc', incorrect: '#666666', textPrimary: '#ffffff', textSecondary: '#999999' }},
  
  // Colorful themes
  { id: 'rainbow', name: 'Rainbow', colors: { primary: '#1a1a2e', secondary: '#16213e', accent: '#ff6b6b', correct: '#4ecdc4', incorrect: '#ff9ff3', textPrimary: '#f7dc6f', textSecondary: '#bb8fce' }},
  { id: 'galaxy', name: 'Galaxy', colors: { primary: '#0f0f23', secondary: '#1a1a3e', accent: '#c39bd3', correct: '#85c1e9', incorrect: '#f1948a', textPrimary: '#f8c471', textSecondary: '#a569bd' }},
  { id: 'tropical', name: 'Tropical', colors: { primary: '#004d40', secondary: '#00695c', accent: '#ff5722', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#80cbc4', textSecondary: '#4db6ac' }},
  { id: 'autumn', name: 'Autumn', colors: { primary: '#3e2723', secondary: '#5d4037', accent: '#ff9800', correct: '#8bc34a', incorrect: '#d32f2f', textPrimary: '#ffcc02', textSecondary: '#ff8f00' }},
  { id: 'spring', name: 'Spring', colors: { primary: '#1b5e20', secondary: '#2e7d32', accent: '#cddc39', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#c8e6c9', textSecondary: '#a5d6a7' }},
  
  // Tech themes
  { id: 'vscode', name: 'VS Code', colors: { primary: '#1e1e1e', secondary: '#2d2d30', accent: '#007acc', correct: '#4ec9b0', incorrect: '#f14c4c', textPrimary: '#cccccc', textSecondary: '#969696' }},
  { id: 'sublime', name: 'Sublime', colors: { primary: '#263238', secondary: '#37474f', accent: '#ff9800', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#ffffff', textSecondary: '#90a4ae' }},
  { id: 'atom', name: 'Atom', colors: { primary: '#1d1f21', secondary: '#2d2f31', accent: '#55b5db', correct: '#90c695', incorrect: '#cc6666', textPrimary: '#c5c8c6', textSecondary: '#969896' }},
  { id: 'github', name: 'GitHub', colors: { primary: '#0d1117', secondary: '#21262d', accent: '#f78166', correct: '#56d364', incorrect: '#f85149', textPrimary: '#f0f6fc', textSecondary: '#8b949e' }},
  
  // Game themes
  { id: 'mario', name: 'Mario', colors: { primary: '#0066cc', secondary: '#0052a3', accent: '#ff0000', correct: '#00cc00', incorrect: '#cc0000', textPrimary: '#ffffff', textSecondary: '#ccddff' }},
  { id: 'zelda', name: 'Zelda', colors: { primary: '#2d5016', secondary: '#3a6b1c', accent: '#ffd700', correct: '#00cc00', incorrect: '#cc0000', textPrimary: '#ffffff', textSecondary: '#ccffcc' }},
  { id: 'sonic', name: 'Sonic', colors: { primary: '#0066ff', secondary: '#0052cc', accent: '#ffcc00', correct: '#00cc00', incorrect: '#cc0000', textPrimary: '#ffffff', textSecondary: '#ccddff' }},
  
  // High contrast themes
  { id: 'high-contrast', name: 'High Contrast', colors: { primary: '#000000', secondary: '#1a1a1a', accent: '#ffff00', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#cccccc' }},
  { id: 'inverted', name: 'Inverted', colors: { primary: '#ffffff', secondary: '#e5e5e5', accent: '#0000ff', correct: '#008000', incorrect: '#800000', textPrimary: '#000000', textSecondary: '#333333' }},
  
  // Themed colors
  { id: 'ocean-deep', name: 'Ocean Deep', colors: { primary: '#001122', secondary: '#002244', accent: '#00aaff', correct: '#00ffaa', incorrect: '#ff4400', textPrimary: '#aaeeff', textSecondary: '#66ccee' }},
  { id: 'fire-red', name: 'Fire Red', colors: { primary: '#220000', secondary: '#440000', accent: '#ff4400', correct: '#00ff44', incorrect: '#aa0000', textPrimary: '#ffaaaa', textSecondary: '#ee6666' }},
  { id: 'electric-blue', name: 'Electric Blue', colors: { primary: '#000022', secondary: '#000044', accent: '#4400ff', correct: '#44ff00', incorrect: '#ff0044', textPrimary: '#aaaaff', textSecondary: '#6666ee' }},
  { id: 'toxic-green', name: 'Toxic Green', colors: { primary: '#002200', secondary: '#004400', accent: '#44ff00', correct: '#00ff44', incorrect: '#ff0044', textPrimary: '#aaffaa', textSecondary: '#66ee66' }},
  
  // More creative themes
  { id: 'cotton-candy', name: 'Cotton Candy', colors: { primary: '#ffb3d9', secondary: '#ff99cc', accent: '#ff66b3', correct: '#66ff99', incorrect: '#ff6666', textPrimary: '#660033', textSecondary: '#990066' }},
  { id: 'midnight-oil', name: 'Midnight Oil', colors: { primary: '#0d1020', secondary: '#1a2040', accent: '#ffa500', correct: '#32cd32', incorrect: '#dc143c', textPrimary: '#f0f8ff', textSecondary: '#b0c4de' }},
  { id: 'golden-hour', name: 'Golden Hour', colors: { primary: '#2c1810', secondary: '#4a2c18', accent: '#ffa500', correct: '#32cd32', incorrect: '#dc143c', textPrimary: '#ffd700', textSecondary: '#daa520' }},
  { id: 'lavender-mist', name: 'Lavender Mist', colors: { primary: '#e6e6fa', secondary: '#dda0dd', accent: '#9370db', correct: '#32cd32', incorrect: '#dc143c', textPrimary: '#4b0082', textSecondary: '#663399' }},
  
  // Extended theme collection
  { id: 'midnight-blue', name: 'Midnight Blue', colors: { primary: '#191970', secondary: '#25258a', accent: '#87ceeb', correct: '#00ff7f', incorrect: '#ff4500', textPrimary: '#f0f8ff', textSecondary: '#b0c4de' }},
  { id: 'crimson-red', name: 'Crimson Red', colors: { primary: '#8b0000', secondary: '#a52a2a', accent: '#dc143c', correct: '#32cd32', incorrect: '#ff6347', textPrimary: '#ffe4e1', textSecondary: '#ffc0cb' }},
  { id: 'emerald-green', name: 'Emerald Green', colors: { primary: '#006400', secondary: '#228b22', accent: '#00ff7f', correct: '#98fb98', incorrect: '#ff0000', textPrimary: '#f0fff0', textSecondary: '#90ee90' }},
  { id: 'royal-purple', name: 'Royal Purple', colors: { primary: '#4b0082', secondary: '#663399', accent: '#9370db', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#e6e6fa', textSecondary: '#dda0dd' }},
  { id: 'sunset-orange', name: 'Sunset Orange', colors: { primary: '#ff4500', secondary: '#ff6347', accent: '#ffa500', correct: '#32cd32', incorrect: '#dc143c', textPrimary: '#fff8dc', textSecondary: '#ffe4b5' }},
  { id: 'arctic-white', name: 'Arctic White', colors: { primary: '#f8f8ff', secondary: '#f5f5f5', accent: '#4169e1', correct: '#228b22', incorrect: '#dc143c', textPrimary: '#2f4f4f', textSecondary: '#696969' }},
  { id: 'deep-space', name: 'Deep Space', colors: { primary: '#000000', secondary: '#1c1c1c', accent: '#00bfff', correct: '#00ff00', incorrect: '#ff1493', textPrimary: '#ffffff', textSecondary: '#c0c0c0' }},
  { id: 'forest-green', name: 'Forest Green', colors: { primary: '#2e8b57', secondary: '#3cb371', accent: '#90ee90', correct: '#98fb98', incorrect: '#ff0000', textPrimary: '#f0fff0', textSecondary: '#90ee90' }},
  { id: 'steel-gray', name: 'Steel Gray', colors: { primary: '#2f4f4f', secondary: '#696969', accent: '#b0c4de', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#f5f5f5', textSecondary: '#dcdcdc' }},
  { id: 'rose-gold', name: 'Rose Gold', colors: { primary: '#b76e79', secondary: '#d4a5a5', accent: '#e91e63', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#ffffff', textSecondary: '#f8bbd9' }},
  
  // Coffee & Earth tones
  { id: 'espresso', name: 'Espresso', colors: { primary: '#3c2414', secondary: '#5d4037', accent: '#8d6e63', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#d7ccc8', textSecondary: '#a1887f' }},
  { id: 'cappuccino', name: 'Cappuccino', colors: { primary: '#6f4e37', secondary: '#8b4513', accent: '#deb887', correct: '#228b22', incorrect: '#b22222', textPrimary: '#f5deb3', textSecondary: '#d2b48c' }},
  { id: 'mocha', name: 'Mocha', colors: { primary: '#704214', secondary: '#a0522d', accent: '#cd853f', correct: '#9acd32', incorrect: '#dc143c', textPrimary: '#faebd7', textSecondary: '#deb887' }},
  { id: 'latte', name: 'Latte', colors: { primary: '#d2b48c', secondary: '#f5deb3', accent: '#8b4513', correct: '#228b22', incorrect: '#b22222', textPrimary: '#2f4f4f', textSecondary: '#696969' }},
  
  // Jewel tones
  { id: 'sapphire', name: 'Sapphire', colors: { primary: '#082567', secondary: '#1e3a8a', accent: '#3b82f6', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#dbeafe', textSecondary: '#93c5fd' }},
  { id: 'ruby', name: 'Ruby', colors: { primary: '#7f1d1d', secondary: '#991b1b', accent: '#ef4444', correct: '#10b981', incorrect: '#b91c1c', textPrimary: '#fecaca', textSecondary: '#f87171' }},
  { id: 'emerald', name: 'Emerald', colors: { primary: '#064e3b', secondary: '#065f46', accent: '#10b981', correct: '#22c55e', incorrect: '#ef4444', textPrimary: '#a7f3d0', textSecondary: '#6ee7b7' }},
  { id: 'amethyst', name: 'Amethyst', colors: { primary: '#581c87', secondary: '#7c3aed', accent: '#a855f7', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#e9d5ff', textSecondary: '#c4b5fd' }},
  { id: 'topaz', name: 'Topaz', colors: { primary: '#92400e', secondary: '#b45309', accent: '#f59e0b', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#fef3c7', textSecondary: '#fcd34d' }},
  
  // Neon variations
  { id: 'cyber-pink', name: 'Cyber Pink', colors: { primary: '#0a0a0a', secondary: '#1a0a1a', accent: '#ff0077', correct: '#00ff88', incorrect: '#ff0044', textPrimary: '#ff88cc', textSecondary: '#cc44aa' }},
  { id: 'laser-lime', name: 'Laser Lime', colors: { primary: '#0a0a0a', secondary: '#0a1a0a', accent: '#88ff00', correct: '#ccff44', incorrect: '#ff0044', textPrimary: '#ccff88', textSecondary: '#88cc44' }},
  { id: 'electric-cyan', name: 'Electric Cyan', colors: { primary: '#0a0a0a', secondary: '#0a1a1a', accent: '#00ffff', correct: '#44ffcc', incorrect: '#ff0044', textPrimary: '#88ffff', textSecondary: '#44cccc' }},
  { id: 'neon-yellow', name: 'Neon Yellow', colors: { primary: '#0a0a0a', secondary: '#1a1a0a', accent: '#ffff00', correct: '#88ff44', incorrect: '#ff0044', textPrimary: '#ffff88', textSecondary: '#cccc44' }},
  
  // Retro gaming
  { id: 'gameboy', name: 'Game Boy', colors: { primary: '#9bbc0f', secondary: '#8bac0f', accent: '#306230', correct: '#0f380f', incorrect: '#9bbc0f', textPrimary: '#0f380f', textSecondary: '#306230' }},
  { id: 'nintendo', name: 'Nintendo', colors: { primary: '#e60012', secondary: '#0066cc', accent: '#ffcc00', correct: '#00cc00', incorrect: '#cc0000', textPrimary: '#ffffff', textSecondary: '#cccccc' }},
  { id: 'playstation', name: 'PlayStation', colors: { primary: '#003087', secondary: '#0070d1', accent: '#00d9ff', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#b3e5fc' }},
  { id: 'xbox', name: 'Xbox', colors: { primary: '#107c10', secondary: '#2d8f2d', accent: '#68cc6c', correct: '#84ff84', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#c8f7c8' }},
  
  // Weather themes
  { id: 'storm', name: 'Storm', colors: { primary: '#2c3e50', secondary: '#34495e', accent: '#f39c12', correct: '#27ae60', incorrect: '#e74c3c', textPrimary: '#ecf0f1', textSecondary: '#bdc3c7' }},
  { id: 'sunny', name: 'Sunny', colors: { primary: '#f39c12', secondary: '#e67e22', accent: '#f1c40f', correct: '#27ae60', incorrect: '#e74c3c', textPrimary: '#2c3e50', textSecondary: '#7f8c8d' }},
  { id: 'rainy', name: 'Rainy', colors: { primary: '#34495e', secondary: '#2c3e50', accent: '#3498db', correct: '#2ecc71', incorrect: '#e74c3c', textPrimary: '#ecf0f1', textSecondary: '#95a5a6' }},
  { id: 'snowy', name: 'Snowy', colors: { primary: '#ecf0f1', secondary: '#bdc3c7', accent: '#3498db', correct: '#27ae60', incorrect: '#e74c3c', textPrimary: '#2c3e50', textSecondary: '#7f8c8d' }},
  
  // 20 More Super Unique & Creative Colorways
  { id: 'holographic', name: 'Holographic', colors: { primary: '#1a0033', secondary: '#330066', accent: '#ff00ff', correct: '#00ffcc', incorrect: '#ff3366', textPrimary: '#ccffff', textSecondary: '#9966ff' }},
  { id: 'phantom', name: 'Phantom', colors: { primary: '#0f0f0f', secondary: '#1f1f1f', accent: '#666666', correct: '#999999', incorrect: '#333333', textPrimary: '#cccccc', textSecondary: '#888888' }},
  { id: 'prismatic', name: 'Prismatic', colors: { primary: '#000033', secondary: '#003366', accent: '#00ccff', correct: '#66ff99', incorrect: '#ff6699', textPrimary: '#ffffff', textSecondary: '#99ccff' }},
  { id: 'molten-lava', name: 'Molten Lava', colors: { primary: '#330000', secondary: '#660000', accent: '#ff3300', correct: '#ffcc00', incorrect: '#990000', textPrimary: '#ffcccc', textSecondary: '#ff9966' }},
  { id: 'arctic-aurora', name: 'Arctic Aurora', colors: { primary: '#001133', secondary: '#002266', accent: '#00ff99', correct: '#66ffcc', incorrect: '#ff3399', textPrimary: '#ccffff', textSecondary: '#99ffcc' }},
  { id: 'digital-dream', name: 'Digital Dream', colors: { primary: '#110033', secondary: '#220066', accent: '#aa00ff', correct: '#00ffaa', incorrect: '#ff0099', textPrimary: '#ddccff', textSecondary: '#bb99ff' }},
  { id: 'cosmic-dust', name: 'Cosmic Dust', colors: { primary: '#1a0f1a', secondary: '#331e33', accent: '#b366b3', correct: '#66cc66', incorrect: '#cc3366', textPrimary: '#e6cce6', textSecondary: '#cc99cc' }},
  { id: 'neon-nights', name: 'Neon Nights', colors: { primary: '#0a0a0a', secondary: '#1a0a1a', accent: '#ff0088', correct: '#88ff00', incorrect: '#ff4400', textPrimary: '#ff88dd', textSecondary: '#cc44aa' }},
  { id: 'crystalline', name: 'Crystalline', colors: { primary: '#f0f8ff', secondary: '#e0f0ff', accent: '#4080ff', correct: '#00cc88', incorrect: '#ff4466', textPrimary: '#003366', textSecondary: '#0066aa' }},
  { id: 'shadow-realm', name: 'Shadow Realm', colors: { primary: '#0d0d0d', secondary: '#1a1a1a', accent: '#4d0080', correct: '#008040', incorrect: '#800040', textPrimary: '#cccccc', textSecondary: '#999999' }},
  { id: 'golden-hour-dream', name: 'Golden Hour Dream', colors: { primary: '#2a1f0d', secondary: '#4a351a', accent: '#ffcc33', correct: '#99cc33', incorrect: '#cc3333', textPrimary: '#ffe099', textSecondary: '#ccaa66' }},
  { id: 'electric-storm', name: 'Electric Storm', colors: { primary: '#001a33', secondary: '#003366', accent: '#0099ff', correct: '#33cc99', incorrect: '#cc3399', textPrimary: '#ccf0ff', textSecondary: '#99ddff' }},
  { id: 'cherry-blossom', name: 'Cherry Blossom', colors: { primary: '#ffe6f0', secondary: '#ffccdd', accent: '#ff6699', correct: '#66cc99', incorrect: '#cc6666', textPrimary: '#663344', textSecondary: '#996666' }},
  { id: 'void-walker', name: 'Void Walker', colors: { primary: '#000000', secondary: '#0d0d0d', accent: '#800080', correct: '#408040', incorrect: '#804040', textPrimary: '#cccccc', textSecondary: '#999999' }},
  { id: 'plasma-wave', name: 'Plasma Wave', colors: { primary: '#1a001a', secondary: '#330033', accent: '#ff33ff', correct: '#33ff99', incorrect: '#ff3366', textPrimary: '#ffccff', textSecondary: '#cc99cc' }},
  { id: 'frost-bite', name: 'Frost Bite', colors: { primary: '#e6f7ff', secondary: '#ccf0ff', accent: '#0080cc', correct: '#00cc80', incorrect: '#cc4080', textPrimary: '#003366', textSecondary: '#0066aa' }},
  { id: 'quantum-flux', name: 'Quantum Flux', colors: { primary: '#0f0f1f', secondary: '#1f1f3f', accent: '#8080ff', correct: '#80ff80', incorrect: '#ff8080', textPrimary: '#e0e0ff', textSecondary: '#c0c0ff' }},
  { id: 'solar-flare', name: 'Solar Flare', colors: { primary: '#331100', secondary: '#662200', accent: '#ffaa00', correct: '#88cc44', incorrect: '#cc4444', textPrimary: '#ffdd88', textSecondary: '#ffbb44' }},
  { id: 'mystic-forest', name: 'Mystic Forest', colors: { primary: '#0d2818', secondary: '#1a4030', accent: '#66cc66', correct: '#99dd99', incorrect: '#cc6666', textPrimary: '#ccffcc', textSecondary: '#99dd99' }},
  { id: 'galactic-core', name: 'Galactic Core', colors: { primary: '#1a0066', secondary: '#3300cc', accent: '#cc66ff', correct: '#66ffcc', incorrect: '#ff6699', textPrimary: '#f0e6ff', textSecondary: '#d4b3ff' }},
  
  // New Gradient Themes
  { id: 'sunset-horizon', name: 'Sunset Horizon', colors: { primary: '#1a0d26', secondary: '#331a4d', accent: '#ff6b35', correct: '#4ecdc4', incorrect: '#f38ba8', textPrimary: '#ffe66d', textSecondary: '#ffb700' }},
  { id: 'ocean-depth', name: 'Ocean Depth', colors: { primary: '#0f1419', secondary: '#1e2832', accent: '#00d4aa', correct: '#7dd3fc', incorrect: '#f87171', textPrimary: '#a5f3fc', textSecondary: '#67e8f9' }},
  { id: 'aurora-gradient', name: 'Aurora Gradient', colors: { primary: '#0c0a1e', secondary: '#1a1535', accent: '#a855f7', correct: '#34d399', incorrect: '#fb7185', textPrimary: '#c4b5fd', textSecondary: '#8b5cf6' }},
  { id: 'fire-ice', name: 'Fire & Ice', colors: { primary: '#0d1b2a', secondary: '#1b263b', accent: '#e63946', correct: '#06ffa5', incorrect: '#f72585', textPrimary: '#f1faee', textSecondary: '#a8dadc' }},
  { id: 'cosmic-nebula', name: 'Cosmic Nebula', colors: { primary: '#1e0a3c', secondary: '#3d1a78', accent: '#ff006e', correct: '#8338ec', incorrect: '#fb5607', textPrimary: '#f72585', textSecondary: '#c77dff' }},
  { id: 'tropical-paradise', name: 'Tropical Paradise', colors: { primary: '#0f2027', secondary: '#203a43', accent: '#2c5530', correct: '#4ecdc4', incorrect: '#ff6b6b', textPrimary: '#a8e6cf', textSecondary: '#7fcdcd' }}
]

// Additional themes from legacy config
THEMES.push(
  { id: 'monkeytype', name: 'MonkeyType', colors: { primary: '#323437', secondary: '#2c2e31', accent: '#e2b714', correct: '#e2b714', incorrect: '#ca4754', textPrimary: '#d1d0c5', textSecondary: '#646669' }},
  { id: 'catppuccin', name: 'Catppuccin Mocha', colors: { primary: '#1e1e2e', secondary: '#313244', accent: '#cba6f7', correct: '#a6e3a1', incorrect: '#f38ba8', textPrimary: '#cdd6f4', textSecondary: '#6c7086' }},
  { id: 'tokyo-night', name: 'Tokyo Night', colors: { primary: '#1a1b26', secondary: '#24283b', accent: '#7aa2f7', correct: '#9ece6a', incorrect: '#f7768e', textPrimary: '#c0caf5', textSecondary: '#565f89' }},
  { id: 'solarized', name: 'Solarized Dark', colors: { primary: '#002b36', secondary: '#073642', accent: '#268bd2', correct: '#859900', incorrect: '#dc322f', textPrimary: '#839496', textSecondary: '#586e75' }},
  { id: 'github-dark', name: 'GitHub Dark', colors: { primary: '#0d1117', secondary: '#161b22', accent: '#58a6ff', correct: '#3fb950', incorrect: '#f85149', textPrimary: '#c9d1d9', textSecondary: '#8b949e' }},
  { id: 'one-dark', name: 'One Dark', colors: { primary: '#282c34', secondary: '#21252b', accent: '#61afef', correct: '#98c379', incorrect: '#e06c75', textPrimary: '#abb2bf', textSecondary: '#5c6370' }},
  { id: 'rose-pine', name: 'Rose Pine', colors: { primary: '#191724', secondary: '#1f1d2e', accent: '#ebbcba', correct: '#9ccfd8', incorrect: '#eb6f92', textPrimary: '#e0def4', textSecondary: '#908caa' }},
  { id: 'everforest', name: 'Everforest', colors: { primary: '#2d353b', secondary: '#343f44', accent: '#a7c080', correct: '#83c092', incorrect: '#e67e80', textPrimary: '#d3c6aa', textSecondary: '#859289' }},
  { id: 'kanagawa', name: 'Kanagawa', colors: { primary: '#1f1f28', secondary: '#2a2a37', accent: '#7e9cd8', correct: '#98bb6c', incorrect: '#e46876', textPrimary: '#dcd7ba', textSecondary: '#727169' }},
  { id: 'material', name: 'Material', colors: { primary: '#263238', secondary: '#37474f', accent: '#80cbc4', correct: '#a5d6a7', incorrect: '#ef9a9a', textPrimary: '#eceff1', textSecondary: '#b0bec5' }}
)

export const DEFAULT_THEME_ID = 'dark'
