import { BtnBack } from "@/components/btnBack"
import { questionsGameMaze } from "@/data/data-game-maze"
import GameMaze from "@/games/game-maze/GameMaze"


export const GameMazeQuestion = () => {
  return (
   <>
      <div className="header">
        <BtnBack />
        <h1>Game Maze</h1>
      </div>
      <div className={'container'}>
        <GameMaze questions={questionsGameMaze} />
      </div>
    </>
  )
}
