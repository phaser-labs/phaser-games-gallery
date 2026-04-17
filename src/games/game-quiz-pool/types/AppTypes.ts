export interface GlobalOptions {
  id: number;
  label: string;
}
export interface Questions {
  id: number;
  image: string;
  altImage: string;
  key: string;
  answerId: number;
}
export interface Options {
  id: number;
  texto: string;
  correcta: boolean;
}
export  interface Quiz {
  id: number;
  pregunta: string;
  opciones: Options[];
}
