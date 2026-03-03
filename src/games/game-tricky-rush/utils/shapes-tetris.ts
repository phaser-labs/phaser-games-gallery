import { Cell, PiecePenaltyType, PieceType } from "../types/types";


export const SHAPES: Record<PieceType, Cell[][]> = {
  O: [
    [
      { x: 1, y: 1 }, { x: 2, y: 1 },
      { x: 1, y: 2 }, { x: 2, y: 2 }
    ]
  ],

  I: [
    [
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }
    ],
    [
      { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }
    ]
  ],

  T: [
    [
      { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
    ],
    [
      { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 1, y: 0 }
    ],
    [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }
    ],
    [
      { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 2 }
    ]
  ],

  S: [
    [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }
    ],
    [
      { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }
    ]
  ],

  Z: [
    [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }
    ],
    [
      { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }
    ]
  ],

  J: [
    [
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
    ],
    [
      { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }
    ],
    [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }
    ],
    [
      { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }
    ]
  ],

  L: [
    [
      { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
    ],
    [
      { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }
    ],
    [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }
    ],
    [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }
    ]
  ],
};

export const SHAPES_PENALTY: Record<PiecePenaltyType, Cell[][]> = {

  D: [
    // 0°
    [
      { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 },
      { x: 1, y: 0 }, { x: 1, y: 2 }
    ],
    // 90°
    [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
      { x: 0, y: 1 }, { x: 2, y: 1 }
    ],
    // 180°
    [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 1, y: 1 }, { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    // 270°
    [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
      { x: 2, y: 0 }, { x: 0, y: 0 }
    ]
  ],

  C: [
    // 0°
    [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 }, { x: 1, y: 2 }
    ],
    // 90°
    [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 }
    ],
    // 180°
    [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 2 }, { x: 1, y: 2 }
    ],
    // 270°
    [
      { x: 0, y: 1 }, { x: 2, y: 1 },
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }
    ]
  ],

  F: [
    // 0°
    [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 }, { x: 2, y: 2 }
    ],
    // 90°
    [
      { x: 2, y: 0 },
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
      { x: 0, y: 2 }
    ],
    // 180°
    [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 }, { x: 1, y: 2 }
    ],
    // 270°
    [
      { x: 2, y: 0 },
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
      { x: 2, y: 2 }
    ]
  ]

};


export function randPieceType(): PieceType {
  const all: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];
  return all[Math.floor(Math.random() * all.length)];
}

export function randPiecePenaltyType(): PiecePenaltyType {
  const all: PiecePenaltyType[] = ["D", "C", "F"];
  return all[Math.floor(Math.random() * all.length)];
}

export function getCells(type: PieceType, rot: number): Cell[] {
  const states = SHAPES[type];
  const raw = states[rot % states.length];
  return normalizeShape(raw);
}

export function getPenaltyCells(type: PiecePenaltyType, rot: number): Cell[] {
  const states = SHAPES_PENALTY[type];
  const raw = states[rot % states.length];
  return normalizeShape(raw);
}

export function normalizeShape(cells: Cell[]): Cell[] {
  let minX = Infinity;
  let minY = Infinity;

  for (const c of cells) {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
  }

  return cells.map(c => ({
    x: c.x - minX,
    y: c.y - minY
  }));
}
