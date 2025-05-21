export interface StopGameContextType {
  listStop: (string | null)[];
  updateListStop: (value: string) => void;
  adduuidList: (id: string) => void;
}
