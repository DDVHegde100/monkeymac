import type { Font } from './types'

export const FONTS: Font[] = [
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
  { id: 'space-grotesk', name: 'Space Grotesk', family: 'Space Grotesk, sans-serif', category: 'display' },
  
  // 25 More Creative Google Fonts
  { id: 'bebas-neue', name: 'Bebas Neue', family: 'Bebas Neue, sans-serif', category: 'display' },
  { id: 'righteous', name: 'Righteous', family: 'Righteous, sans-serif', category: 'display' },
  { id: 'fredoka-one', name: 'Fredoka One', family: 'Fredoka One, sans-serif', category: 'display' },
  { id: 'kalam', name: 'Kalam', family: 'Kalam, handwriting', category: 'handwriting' },
  { id: 'caveat', name: 'Caveat', family: 'Caveat, handwriting', category: 'handwriting' },
  { id: 'dancing-script', name: 'Dancing Script', family: 'Dancing Script, handwriting', category: 'handwriting' },
  { id: 'pacifico', name: 'Pacifico', family: 'Pacifico, handwriting', category: 'handwriting' },
  { id: 'satisfy', name: 'Satisfy', family: 'Satisfy, handwriting', category: 'handwriting' },
  { id: 'architects-daughter', name: 'Architects Daughter', family: 'Architects Daughter, handwriting', category: 'handwriting' },
  { id: 'indie-flower', name: 'Indie Flower', family: 'Indie Flower, handwriting', category: 'handwriting' },
  { id: 'bangers', name: 'Bangers', family: 'Bangers, display', category: 'display' },
  { id: 'bungee', name: 'Bungee', family: 'Bungee, display', category: 'display' },
  { id: 'creepster', name: 'Creepster', family: 'Creepster, display', category: 'display' },
  { id: 'fascinate', name: 'Fascinate', family: 'Fascinate, display', category: 'display' },
  { id: 'griffy', name: 'Griffy', family: 'Griffy, display', category: 'display' },
  { id: 'jolly-lodger', name: 'Jolly Lodger', family: 'Jolly Lodger, display', category: 'display' },
  { id: 'kaushan-script', name: 'Kaushan Script', family: 'Kaushan Script, handwriting', category: 'handwriting' },
  { id: 'lobster', name: 'Lobster', family: 'Lobster, display', category: 'display' },
  { id: 'monoton', name: 'Monoton', family: 'Monoton, display', category: 'display' },
  { id: 'nosifer', name: 'Nosifer', family: 'Nosifer, display', category: 'display' },
  { id: 'orbitron-new', name: 'Orbitron', family: 'Orbitron, sans-serif', category: 'display' },
  { id: 'press-start-2p', name: 'Press Start 2P', family: 'Press Start 2P, monospace', category: 'monospace' },
  { id: 'russo-one', name: 'Russo One', family: 'Russo One, sans-serif', category: 'display' },
  { id: 'stardos-stencil', name: 'Stardos Stencil', family: 'Stardos Stencil, display', category: 'display' },
  { id: 'vampire-wars', name: 'Creepy', family: 'Creepster, display', category: 'display' }
]

export const DEFAULT_FONT_ID = 'jetbrains-mono'
