// SentenceType interface definition
export interface SentenceType {
  sentence: string;
  id: string;
}

// Interface para definir el mundo del juego
export interface WorldType {
  id: number;
  name: string; 
  typography: string; 
  colors: {
    primary: string;
    secondary: string;
    background: string;
    gradient: string;
    text: string;
    scrolltrack: string;
    scrollthumb: string;
    scrollthumbHover: string;
  };
  assets: {
    images: {
      name: string;
      path: string;
    }[];
    sounds: {
      name: string;
      path: string;
    }[];
    wordCardImages: string[];
  };
}

// Datos de ejemplo para diferentes mundos
export const WORLD_THEMES: WorldType[] = [
  {
    id: 1,
    name: "Cocina",
    typography: "Henny",
    colors: {
      primary: "#e36d6d",
      secondary: "#fda9a9",
      background: "#f8fafc",
      // gradiante de los botones
      gradient: "linear-gradient(135deg, #fda9a9 0%, #e36d6d 100%)",
      text: "#121212",
      // para la barra tanto de instrucciones como del preview de la frase
      scrolltrack: "#fcedc4",
      scrollthumb: "#f3d3c5",
      scrollthumbHover: "#e4c7bb",
    },
    assets: {
      images: [
        {
          name: "bg-initial",
          path: "assets/game-reorganize-template/images/theme-kitchen/initial-bg.png"
        },
        {
          name: "bg-instructions",
          path: "assets/game-reorganize-template/images/theme-kitchen/bg-inicial.png"
        },
        {
          name: "bg-main",
          path: "assets/game-reorganize-template/images/theme-kitchen/background-cocina.png"
        },
        {
          name: "bg-contain-previewOrder",
          path: "assets/game-reorganize-template/images/theme-kitchen/recipe-paper.png"
        },
        {
          name: "bg-dropzone",
          path: "assets/game-reorganize-template/images/theme-kitchen/olla.png"
        },
      ],
      sounds: [
        {
          name: "ambient-music",
          path: "assets/game-reorganize-template/sounds/theme-kitchen/ambience-music.mp3"
        },
        {
          name: "drop-sound",
          path: "assets/game-reorganize-template/sounds/theme-kitchen/jump-water.mp3"
        },
        {
          name: "check-sound",
          path: "assets/game-reorganize-template/sounds/theme-kitchen/revisar-btn.wav"
        },
        {
          name: "hover-sound",
          path: "assets/game-reorganize-template/sounds/theme-kitchen/hover-btn.ogg"
        },
      ],
      wordCardImages: [
    'assets/game-reorganize-template/images/theme-kitchen/placeholder.png',
    'assets/game-reorganize-template/images/theme-kitchen/baking_powder.png',
    'assets/game-reorganize-template/images/theme-kitchen/banana.png',
    'assets/game-reorganize-template/images/theme-kitchen/bell_pepper.png',
    'assets/game-reorganize-template/images/theme-kitchen/cabbage.png',
    'assets/game-reorganize-template/images/theme-kitchen/cooking_oil.png',
    'assets/game-reorganize-template/images/theme-kitchen/egg_brown.png',
    'assets/game-reorganize-template/images/theme-kitchen/egg_white.png',
    'assets/game-reorganize-template/images/theme-kitchen/hot_cocoa_mix.png',
    'assets/game-reorganize-template/images/theme-kitchen/flour.png',
    'assets/game-reorganize-template/images/theme-kitchen/ketchup.png',
    'assets/game-reorganize-template/images/theme-kitchen/meat1.png',
    'assets/game-reorganize-template/images/theme-kitchen/meat2.png',
    'assets/game-reorganize-template/images/theme-kitchen/milk_chocolate.png',
    'assets/game-reorganize-template/images/theme-kitchen/milk_gallon.png',
    'assets/game-reorganize-template/images/theme-kitchen/mushroom_white_p.png',
    'assets/game-reorganize-template/images/theme-kitchen/mustard.png',
    'assets/game-reorganize-template/images/theme-kitchen/olive_oil.png',
    'assets/game-reorganize-template/images/theme-kitchen/plain_yogurt.png',
    'assets/game-reorganize-template/images/theme-kitchen/potato.png',
    'assets/game-reorganize-template/images/theme-kitchen/red_apple.png',
    'assets/game-reorganize-template/images/theme-kitchen/salt.png',
    'assets/game-reorganize-template/images/theme-kitchen/sausage_p.png',
     'assets/game-reorganize-template/images/theme-kitchen/strawberry.png',
    'assets/game-reorganize-template/images/theme-kitchen/watermelon1.png',
    'assets/game-reorganize-template/images/theme-kitchen/white_cheese_piece.png'
  ]
    }
  },
  {
    id: 2,
    name: "Universo",
    typography: "Space Mono",
    colors: {
      primary: "#6c5ce7",
      secondary: "#a29bfe",
      background: "#ddd",
      gradient:"linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)",
      text: "#121212",
      scrolltrack: "#6e2c73",
      scrollthumb: "#49294c",
      scrollthumbHover: "#933d67",
    },
    assets: {
      images: [
        {
          name: "bg-initial",
          path: "assets/game-reorganize-template/images/theme-universe/bg-initial-space.png"
        },
        {
          name: "bg-instructions",
          path: "assets/game-reorganize-template/images/theme-universe/space-instructions.jpg"
        },
        {
          name: "bg-main",
          path: "assets/game-reorganize-template/images/theme-universe/main-space.jpg"
        },
        {
          name: "bg-contain-previewOrder",
          path: "assets/game-reorganize-template/images/theme-universe/space-door.png"
        },
        {
          name: "bg-dropzone",
          path: "assets/game-reorganize-template/images/theme-universe/black-hole.png"
        },
      ],
       sounds: [
        {
          name: "ambient-music",
          path: "assets/game-reorganize-template/sounds/theme-universe/ambience-music.mp3"
        },
        {
          name: "drop-sound",
          path: "assets/game-reorganize-template/sounds/theme-universe/drop-zone.wav"
        },
        {
          name: "check-sound",
          path: "assets/game-reorganize-template/sounds/theme-universe/revisar-btn.wav"
        },
        {
          name: "hover-sound",
          path: "assets/game-reorganize-template/sounds/theme-universe/hover-btn.wav"
        },
      ],
      wordCardImages: [
        "assets/game-reorganize-template/images/theme-universe/earth.png",
        "assets/game-reorganize-template/images/theme-universe/jupiter.png",
        "assets/game-reorganize-template/images/theme-universe/mars.png",
        "assets/game-reorganize-template/images/theme-universe/mercure.png",
        "assets/game-reorganize-template/images/theme-universe/moon.png",
        "assets/game-reorganize-template/images/theme-universe/neptune.png",
        "assets/game-reorganize-template/images/theme-universe/pluton.png"
      ]
    }
  },
  {
    id: 3,
    name: "Halloween",
    typography: "Creepster",
    colors: {
      primary: "#fcb954",
      secondary: "#e11313",
      background: "#bbb",
      gradient:"linear-gradient(135deg, #fcb954 0%, #e11313 100%)",
      text: "#121212",
      scrolltrack: "#fcedc4",
      scrollthumb: "#f3d3c5",
      scrollthumbHover: "#e4c7bb",
    },
    assets: {
      images: [
        {
          name: "bg-initial",
          path: "assets/game-reorganize-template/images/theme-halloween/bg-initial-halloween.jpg"
        },
        {
          name: "bg-instructions",
          path: "assets/game-reorganize-template/images/theme-halloween/bg-instructions.webp"
        },
        {
          name: "bg-main",
          path: "assets/game-reorganize-template/images/theme-halloween/bg-main-h.png"
        },
        {
          name: "bg-contain-previewOrder",
          path: "assets/game-reorganize-template/images/theme-halloween/recipe-book.png" //cambiar
        },
        {
          name: "bg-dropzone",
          path: "assets/game-reorganize-template/images/theme-halloween/caldero.png" 
        },
      ],
      sounds: [
        {
          name: "ambient-music",
          path: "assets/game-reorganize-template/sounds/theme-halloween/ambience-music.mp3"
        },
        {
          name: "drop-sound",
          path: "assets/game-reorganize-template/sounds/theme-halloween/drop-in-zone.ogg"
        },
        {
          name: "check-sound",
          path: "assets/game-reorganize-template/sounds/theme-halloween/revisar-btn.wav"
        },
        {
          name: "hover-sound",
          path: "assets/game-reorganize-template/sounds/theme-halloween/hover-btn.wav"
        },
      ],
      wordCardImages: [
        "assets/game-reorganize-template/images/theme-halloween/halloween-card1.png",
        "assets/game-reorganize-template/images/theme-halloween/halloween-card2.png",
        "assets/game-reorganize-template/images/theme-halloween/halloween-card3.png",
        "assets/game-reorganize-template/images/theme-halloween/halloween-card4.png",
        "assets/game-reorganize-template/images/theme-halloween/halloween-card5.png",
        "assets/game-reorganize-template/images/theme-halloween/halloween-card6.png"
      ]
    }
  }
];
