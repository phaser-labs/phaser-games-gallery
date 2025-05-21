interface dataGameProps {
    name: string,
    image: string,
    url: string,
}

export const dataGames: dataGameProps[] = [
    {
        name: 'Frog Jumping',
        image: "assets/images/game-frog-jumping.webp",
        url: '/#/games/frog-jumping',
    },
    {
        name: 'Car Question',
        image: "assets/images/game-car-question.webp",
        url: '/#/games/car-question',
    },
    {
        name: 'Maze Game',
        image: "assets/images/game-maze.webp",
        url: '/#/games/maze-game',
    },
    {
        name: 'Camino de preguntas',
        image: "assets/images/camino-preguntas.webp",
        url: '/#/games/road-say',
    },
    {
        name: 'Desafío del Arquero',
        image: "assets/images/desafio-arquero.webp",
        url: '/#/games/arquery-game',
    },
    {
        name: 'Arcanum Archer',
        image: "assets/images/arcanum-archer.webp",
        url: '/#/games/arcanum-archer',
    }
];