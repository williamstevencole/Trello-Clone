export type UsuarioType = {
  id: number;
  nombre: string;
  authid: number;
  rol: "admin" | "limitado";
  foto_perfil: string;
  created_at: string;
};

export type DeckType = {
  id: number;
  wallpaper: number;
  owner: number;
  pfp: string; // url de la imagen de perfil del dueño
  banner: string; // url de la imagen de banner del board
  title: string;
  description: string;
  created_at: string;
};

export type ColumnType = {
  id: number;
  deckid: number;
  nombre: string;
  posicion: number;
  created_at: string;
};

export type CardType = {
  id: number;
  deckid: number;
  DeckColumn: number;
  Title: string;
  Description: string;
  created_at: string;
};
