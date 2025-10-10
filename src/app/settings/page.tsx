'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../../../styles/enhanced-settings.css'

interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    correct: string
    incorrect: string
    textPrimary: string
    textSecondary: string
  }
}

interface Font {
  id: string
  name: string
  family: string
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting'
}

const THEMES: Theme[] = [
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
  { id: 'snowy', name: 'Snowy', colors: { primary: '#ecf0f1', secondary: '#bdc3c7', accent: '#3498db', correct: '#27ae60', incorrect: '#e74c3c', textPrimary: '#2c3e50', textSecondary: '#7f8c8d' }}
]

const FONTS: Font[] = [
  // Monospace fonts (best for typing tests)
  { id: 'fira-code', name: 'Fira Code', family: 'Fira Code, Monaco, Consolas, monospace', category: 'monospace' },
  { id: 'jetbrains-mono', name: 'JetBrains Mono', family: 'JetBrains Mono, monospace', category: 'monospace' },
  { id: 'source-code-pro', name: 'Source Code Pro', family: 'Source Code Pro, monospace', category: 'monospace' },
  { id: 'consolas', name: 'Consolas', family: 'Consolas, Monaco, monospace', category: 'monospace' },
  { id: 'monaco', name: 'Monaco', family: 'Monaco, Consolas, monospace', category: 'monospace' },
  { id: 'courier-new', name: 'Courier New', family: 'Courier New, Courier, monospace', category: 'monospace' },
  { id: 'roboto-mono', name: 'Roboto Mono', family: 'Roboto Mono, monospace', category: 'monospace' },
  { id: 'ubuntu-mono', name: 'Ubuntu Mono', family: 'Ubuntu Mono, monospace', category: 'monospace' },
  { id: 'cascadia-code', name: 'Cascadia Code', family: 'Cascadia Code, Consolas, monospace', category: 'monospace' },
  { id: 'inconsolata', name: 'Inconsolata', family: 'Inconsolata, monospace', category: 'monospace' },
  { id: 'sf-mono', name: 'SF Mono', family: 'SF Mono, Monaco, Inconsolata, monospace', category: 'monospace' },
  { id: 'menlo', name: 'Menlo', family: 'Menlo, Consolas, Monaco, monospace', category: 'monospace' },
  
  // Modern Sans-serif fonts (including Apple & Google)
  { id: 'sf-pro', name: 'SF Pro Display', family: '-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif', category: 'sans-serif' },
  { id: 'product-sans', name: 'Product Sans', family: 'Product Sans, Google Sans, system-ui, sans-serif', category: 'sans-serif' },
  { id: 'google-sans', name: 'Google Sans', family: 'Google Sans, Product Sans, system-ui, sans-serif', category: 'sans-serif' },
  { id: 'inter', name: 'Inter', family: 'Inter, system-ui, sans-serif', category: 'sans-serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, system-ui, sans-serif', category: 'sans-serif' },
  { id: 'helvetica', name: 'Helvetica Neue', family: 'Helvetica Neue, Helvetica, Arial, sans-serif', category: 'sans-serif' },
  { id: 'arial', name: 'Arial', family: 'Arial, Helvetica, sans-serif', category: 'sans-serif' },
  { id: 'open-sans', name: 'Open Sans', family: 'Open Sans, sans-serif', category: 'sans-serif' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif', category: 'sans-serif' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'sans-serif' },
  { id: 'nunito', name: 'Nunito', family: 'Nunito, sans-serif', category: 'sans-serif' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif', category: 'sans-serif' },
  { id: 'work-sans', name: 'Work Sans', family: 'Work Sans, sans-serif', category: 'sans-serif' },
  { id: 'dm-sans', name: 'DM Sans', family: 'DM Sans, sans-serif', category: 'sans-serif' },
  { id: 'system-ui', name: 'System UI', family: 'system-ui, -apple-system, sans-serif', category: 'sans-serif' },
  
  // Serif fonts
  { id: 'times-new-roman', name: 'Times New Roman', family: 'Times New Roman, Times, serif', category: 'serif' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, Times, serif', category: 'serif' },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, serif', category: 'serif' },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, serif', category: 'serif' },
  { id: 'crimson-text', name: 'Crimson Text', family: 'Crimson Text, serif', category: 'serif' },
  
  // Display & Creative fonts with glow effects
  { id: 'orbitron', name: 'Orbitron (Glow)', family: 'Orbitron, monospace', category: 'display' },
  { id: 'exo-2', name: 'Exo 2 (Glow)', family: 'Exo 2, sans-serif', category: 'display' },
  { id: 'raleway', name: 'Raleway (Glow)', family: 'Raleway, sans-serif', category: 'display' },
  { id: 'quicksand', name: 'Quicksand (Glow)', family: 'Quicksand, sans-serif', category: 'display' },
  { id: 'nova-mono', name: 'Nova Mono (Glow)', family: 'Nova Mono, monospace', category: 'display' },
  { id: 'libre-baskerville', name: 'Libre Baskerville', family: 'Libre Baskerville, serif', category: 'serif' },
  
  // Display fonts
  { id: 'lexend', name: 'Lexend', family: 'Lexend, sans-serif', category: 'display' },
  { id: 'comfortaa', name: 'Comfortaa', family: 'Comfortaa, sans-serif', category: 'display' },
  { id: 'quicksand', name: 'Quicksand', family: 'Quicksand, sans-serif', category: 'display' },
  { id: 'space-grotesk', name: 'Space Grotesk', family: 'Space Grotesk, sans-serif', category: 'display' }
]

export default function SettingsPage() {
  const router = useRouter()
  const [currentTheme, setCurrentTheme] = useState('dark')
  const [currentFont, setCurrentFont] = useState('fira-code')
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [testFontSize, setTestFontSize] = useState(3) // rem units
  const [operationStats, setOperationStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
    loadSavedTheme()
    loadSavedFont()
    loadSavedFontSize()
    if (isAuthenticated) {
      loadOperationStats()
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        // Load user preferences after authentication
        loadUserPreferences()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        const { theme, font } = data.preferences
        
        // Apply theme and font
        setCurrentTheme(theme)
        applyTheme(theme)
        setCurrentFont(font)
        applyFont(font)
        
        // Also save to localStorage as backup
        localStorage.setItem('monkeymax-theme', theme)
        localStorage.setItem('monkeymax-font', font)
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error)
      // Fall back to localStorage if backend fails
      loadSavedTheme()
      loadSavedFont()
    }
  }

  const saveUserPreferences = async (theme: string, font: string) => {
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme, font }),
      })
    } catch (error) {
      console.error('Failed to save user preferences:', error)
    }
  }

  const loadSavedTheme = () => {
    const savedTheme = localStorage.getItem('monkeymax-theme')
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }

  const loadSavedFont = () => {
    const savedFont = localStorage.getItem('monkeymax-font')
    if (savedFont) {
      setCurrentFont(savedFont)
      applyFont(savedFont)
    }
  }

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId)
    if (!theme) return

    const root = document.documentElement
    root.style.setProperty('--bg-primary', theme.colors.primary)
    root.style.setProperty('--bg-secondary', theme.colors.secondary)
    root.style.setProperty('--text-primary', theme.colors.textPrimary)
    root.style.setProperty('--text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--accent', theme.colors.accent)
    root.style.setProperty('--correct', theme.colors.correct)
    root.style.setProperty('--incorrect', theme.colors.incorrect)
  }

  const applyFont = (fontId: string) => {
    const font = FONTS.find(f => f.id === fontId)
    if (!font) return

    const root = document.documentElement
    root.style.setProperty('--font-family', font.family)
  }

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId)
    applyTheme(themeId)
    localStorage.setItem('monkeymax-theme', themeId)
    
    // Save to backend if authenticated
    if (isAuthenticated) {
      saveUserPreferences(themeId, currentFont)
    }
  }

  const handleFontChange = (fontId: string) => {
    setCurrentFont(fontId)
    applyFont(fontId)
    localStorage.setItem('monkeymax-font', fontId)
    
    // Save to backend if authenticated
    if (isAuthenticated) {
      saveUserPreferences(currentTheme, fontId)
    }
  }

  const loadSavedFontSize = () => {
    const savedSize = localStorage.getItem('monkeymax-font-size')
    if (savedSize) {
      const size = parseFloat(savedSize)
      setTestFontSize(size)
      applyFontSize(size)
    }
  }

  const applyFontSize = (size: number) => {
    const root = document.documentElement
    root.style.setProperty('--test-font-size', `${size}rem`)
  }

  const handleFontSizeChange = (size: number) => {
    setTestFontSize(size)
    applyFontSize(size)
    localStorage.setItem('monkeymax-font-size', size.toString())
  }

  const loadOperationStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/user/operation-stats')
      if (response.ok) {
        const data = await response.json()
        setOperationStats(data)
      }
    } catch (error) {
      console.error('Failed to load operation stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="test-container flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-accent">Settings</h1>
        <p className="text-lg text-text-secondary mb-8 text-center max-w-md">
          Please log in to access settings and customize your experience.
        </p>
        <button 
          onClick={() => router.push('/login')}
          className="btn-primary text-xl px-8 py-4"
        >
          Login to Continue
        </button>
      </div>
    )
  }

  return (
    <div className="test-container">
      {/* Navigation */}
      <div className="flex justify-between items-center p-6 bg-bg-secondary">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-accent hover:text-yellow-400"
          >
            MonkeyMac
          </button>
          <nav className="flex space-x-6">
            <button 
              onClick={() => router.push('/test')}
              className="text-text-primary hover:text-accent transition-colors"
            >
              Test
            </button>
            <span className="text-accent font-medium">Settings</span>
          </nav>
        </div>
        <button 
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' })
              .then(() => router.push('/'))
          }}
          className="btn-secondary py-1 px-4 text-sm"
        >
          Logout
        </button>
      </div>
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-accent text-center">Settings</h1>
          </div>

        {/* Theme Selection */}
        <div className="stats-card mb-8">
          <h2 className="text-3xl font-semibold mb-6">Themes</h2>
          <p className="text-text-secondary mb-6">
            Choose from MonkeyType-inspired themes to customize your experience
          </p>
          
          <div className="theme-grid">
            {THEMES.map((theme) => (
              <div
                key={theme.id}
                className={`theme-card ${currentTheme === theme.id ? 'selected' : ''}`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div className="theme-preview" style={{ backgroundColor: theme.colors.primary, color: theme.colors.textPrimary }}>
                  <div className="theme-name" style={{ color: theme.colors.textPrimary }}>
                    {theme.name}
                  </div>
                  
                  <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    123 + 456 = ?
                  </div>

                  <div className="theme-colors">
                    <div className="color-dot" style={{ backgroundColor: theme.colors.primary }} title="Primary" />
                    <div className="color-dot" style={{ backgroundColor: theme.colors.secondary }} title="Secondary" />
                    <div className="color-dot" style={{ backgroundColor: theme.colors.accent }} title="Accent" />
                    <div className="color-dot" style={{ backgroundColor: theme.colors.correct }} title="Correct" />
                    <div className="color-dot" style={{ backgroundColor: theme.colors.incorrect }} title="Incorrect" />
                  </div>

                  {currentTheme === theme.id && (
                    <div className="text-xs font-bold text-center mt-2" style={{ color: theme.colors.accent }}>
                      ✓ ACTIVE
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div className="stats-card mb-8">
          <h2 className="text-3xl font-semibold mb-6">Fonts</h2>
          <p className="text-text-secondary mb-6">
            Choose a font family for the typing test and interface
          </p>
          
          <div className="font-grid">
            {FONTS.map((font) => (
              <div
                key={font.id}
                className={`font-card ${currentFont === font.id ? 'selected' : ''} ${
                  font.category === 'display' ? 'glow-font' : ''
                }`}
                onClick={() => handleFontChange(font.id)}
              >
                <div className="font-preview" style={{ fontFamily: font.family }}>
                  {font.category === 'display' ? (
                    <div className="glow-text">42 + 18 = 60</div>
                  ) : (
                    '42 + 18 = 60'
                  )}
                </div>
                <div className="font-name">{font.name}</div>
                <div className="font-category">{font.category}</div>
                {currentFont === font.id && (
                  <div className="text-accent text-xs font-bold mt-2">✓ ACTIVE</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Font Size Control */}
        <div className="stats-card mb-8">
          <h2 className="text-3xl font-semibold mb-6">Test Font Size</h2>
          <p className="text-text-secondary mb-6">
            Adjust the font size for math problems during tests
          </p>
          
          <div className="font-size-controls">
            <span className="text-text-secondary min-w-[60px]">Small</span>
            <input
              type="range"
              min="1.5"
              max="6"
              step="0.25"
              value={testFontSize}
              onChange={(e) => handleFontSizeChange(parseFloat(e.target.value))}
              className="font-size-slider"
            />
            <span className="text-text-secondary min-w-[60px] text-right">Large</span>
            <span className="text-accent font-bold min-w-[80px] text-center">
              {testFontSize}rem
            </span>
          </div>
          
          {/* Live Preview */}
          <div className="test-preview">
            <div className="test-preview-problem" style={{ fontSize: `${testFontSize}rem` }}>
              42 + 18 = ?
            </div>
            <input 
              type="text" 
              className="test-preview-input"
              style={{ fontSize: `${testFontSize * 0.8}rem` }}
              placeholder="60"
              readOnly
            />
          </div>
        </div>

        {/* Operation Statistics */}
        {operationStats && (
          <div className="stats-card-enhanced mb-8">
            <h2 className="text-3xl font-semibold mb-6">📊 Your Performance by Operation</h2>
            
            {statsLoading ? (
              <div className="text-center text-text-secondary">Loading statistics...</div>
            ) : (
              <>
                {/* Overall Stats */}
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{operationStats.overallStats?.totalTests || 0}</div>
                    <div className="stat-label">Total Tests</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{operationStats.overallStats?.totalProblems || 0}</div>
                    <div className="stat-label">Total Problems</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{operationStats.overallStats?.avgAccuracy?.toFixed(1) || 0}%</div>
                    <div className="stat-label">Overall Accuracy</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{operationStats.overallStats?.avgTimePerProblem?.toFixed(1) || 0}s</div>
                    <div className="stat-label">Avg Time/Problem</div>
                  </div>
                </div>

                {/* Operation Breakdown */}
                <div className="operation-breakdown">
                  {Object.entries(operationStats.operationStats || {}).map(([operation, stats]: [string, any]) => (
                    <div key={operation} className="operation-card">
                      <div className="operation-title">{operation}</div>
                      <div className="operation-stats">
                        <div className="operation-stat">
                          <span>Accuracy:</span>
                          <span className="text-correct font-bold">{stats.avgAccuracy?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="operation-stat">
                          <span>Avg Time:</span>
                          <span className="text-accent font-bold">{stats.avgTimePerProblem?.toFixed(2) || 0}s</span>
                        </div>
                        <div className="operation-stat">
                          <span>Problems:</span>
                          <span className="text-text-primary">{stats.totalProblems || 0}</span>
                        </div>
                        <div className="operation-stat">
                          <span>Tests:</span>
                          <span className="text-text-primary">{stats.testCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Theme Preview */}
        <div className="stats-card">
          <h2 className="text-3xl font-semibold mb-6">Live Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Current Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Theme:</span>
                  <span className="text-text-primary capitalize">
                    {THEMES.find(t => t.id === currentTheme)?.name || currentTheme}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Font:</span>
                  <span className="text-text-primary">
                    {FONTS.find(f => f.id === currentFont)?.name || currentFont}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Test Font Size:</span>
                  <span className="text-text-primary">{testFontSize}rem</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Theme Preview</h3>
              <div className="p-4 rounded-lg bg-bg-secondary">
                <div className="text-4xl font-mono text-center mb-4 text-text-primary">
                  15 × 7 = ?
                </div>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="text-text-secondary">Time: 1:45</span>
                  <span className="text-correct">Score: 23</span>
                  <span className="text-text-secondary">Problems: 25</span>
                </div>
                <div className="flex justify-center gap-1 mt-4">
                  <div className="w-3 h-3 rounded-full bg-correct"></div>
                  <div className="w-3 h-3 rounded-full bg-correct"></div>
                  <div className="w-3 h-3 rounded-full bg-incorrect"></div>
                  <div className="w-3 h-3 rounded-full bg-correct"></div>
                  <div className="w-3 h-3 rounded-full bg-correct"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="stats-card mt-8">
            <h2 className="text-3xl font-semibold mb-6">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Profile</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Name:</span>
                    <span className="text-text-primary">{user.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Username:</span>
                    <span className="text-text-primary">@{user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Phone:</span>
                    <span className="text-text-primary">{user.phone}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/test')}
                    className="w-full btn-primary py-2"
                  >
                    Take Math Test
                  </button>
                  <button 
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST' })
                        .then(() => router.push('/'))
                    }}
                    className="w-full btn-secondary py-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
