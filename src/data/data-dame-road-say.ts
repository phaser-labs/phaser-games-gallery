
interface DataGameRoadDice {
  id: number;
  question: string;
  options: {
    id: string;
    label: string;
    state: 'wrong' | 'success';
  }[];
}
export const dataGameRoadDice: DataGameRoadDice[] = [
  {
    id: 3,
    question: '¿Cuál es el objetivo principal del análisis de actores clave en un proyecto rural?',
    options: [
      {
        id: '1-1',
        label: 'Determinar el presupuesto del proyecto.',
        state: 'wrong'
      },
      {
        id: '1-2',
        label: 'Identificar a las partes interesadas que impactan el proyecto.',
        state: 'success'
      },
      {
        id: '1-3',
        label: 'Fijar los plazos de ejecución.',
        state: 'wrong'
      }
    ]
  },
  {
    id: 7,
    question: '¿Qué busca el análisis de la problemática en un proyecto rural?',
    options: [
      {
        id: '2-1',
        label: 'Examinar los problemas, sus causas y sus consecuencias en la comunidad.',
        state: 'success'
      },
      {
        id: '2-2',
        label: 'Establecer el presupuesto para solucionar los problemas.',
        state: 'wrong'
      },
      {
        id: '2-3',
        label: 'Identificar las oportunidades de crecimiento económico en la comunidad.',
        state: 'wrong'
      }
    ]
  },
  {
    id: 13,
    question: '¿Qué se busca lograr con el análisis de objetivos en un proyecto rural?',
    options: [
      {
        id: '3-1',
        label: 'Definir las metas y fines del proyecto.',
        state: 'success'
      },
      {
        id: '3-2',
        label: 'Establecer el presupuesto para las actividades del proyecto.',
        state: 'wrong'
      },
      {
        id: '3-3',
        label: 'Identificar los actores clave involucrados en el proyecto.',
        state: 'wrong'
      }
    ]
  },
  {
    id: 18,
    question: '¿Qué se muestra en el árbol de problemas?',
    options: [
      {
        id: '4-1',
        label: 'El problema central, sus causas y sus efectos.',
        state: 'wrong'
      },
      {
        id: '4-2',
        label: 'Las soluciones propuestas para el problema.',
        state: 'success'
      },
      {
        id: '4-3',
        label: 'Los medios y fines.',
        state: 'wrong'
      }
    ]
  },
  {
    id: 22,
    question: '¿Qué se muestra en el árbol de problemas?',
    options: [
      {
        id: '5-1',
        label: 'El problema central, sus causas y sus efectos.',
        state: 'wrong'
      },
      {
        id: '5-2',
        label: 'Las soluciones propuestas para el problema.',
        state: 'success'
      },
      {
        id: '5-3',
        label: 'Los medios y fines.',
        state: 'wrong'
      }
    ]
  }
];
