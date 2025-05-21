import "@styles/global.css";


interface CardGameProps {
    name: string;
    image: string;
    url: string;
}
export const CardGame = ({ name, image, url }: CardGameProps) => {
    
  return (
    <>
    <div className="card-game-container">
        <h2>{name}</h2>
        <img src={image} alt={`Imagen del juego  ${name}`} width={300} height={300} />
        <button type="button" aria-label="Comenzar a jugar" formTarget="_blank" onClick={() => window.location.href = url} >Comenzar a jugar</button>
    </div>
    </>
  )
}
