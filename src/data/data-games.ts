interface dataGameProps {
    name: string,
    image: string,
    url: string,
}

export const dataGames: dataGameProps[] = [
    {
        name: 'Frog Jumping',
        image: "assets/images/game-frog-jumping.webp",
        url: 'frog-jumping',
    },
    {
        name: 'Car Question',
        image: "assets/images/game-car-question.webp",
        url: 'car-question',
    },
    {
        name: 'Maze Game',
        image: "assets/images/game-maze.webp",
        url: 'maze-game',
    },
    {
        name: 'Camino de preguntas',
        image: "assets/images/camino-preguntas.webp",
        url: 'road-say',
    },
    {
        name: 'Desafío del Arquero',
        image: "assets/images/desafio-arquero.webp",
        url: 'arquery-game',
    },
    {
        name: 'Arcanum Archer',
        image: "assets/images/arcanum-archer.webp",
        url: 'arcanum-archer',
    }
];