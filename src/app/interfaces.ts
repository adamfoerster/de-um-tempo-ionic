export interface Meeting {
  id: string;
  message: string;
  photo: string;
  songId: string;
  verseId: string;
}

export interface Book {
  type: string;
  version: string;
  book_name: string;
  book_nr: number;
  direction: 'LTR' | 'RTL';
  book: Chapter[];
}

export interface BookListItem {
  id: string;
  name: string;
}

export interface Chapter {
  chapter_nr: number;
  chapter: Verse[];
}

export interface Verse {
  verse_nr: number;
  verse: string;
}

export interface FromUser {
  email: string;
  references: Reference[];
}

export interface Reference {
  id: number;
  reference: string;
  verses: Verse[];
  book: string;
  chapter: number;
  comment?: string;
}

export interface Photos {
  email: string;
  photos: string[];
}
