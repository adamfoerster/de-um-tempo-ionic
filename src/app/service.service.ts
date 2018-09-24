import { Injectable } from '@angular/core';
import { Observable, empty, of, combineLatest } from 'rxjs';
import { shareReplay, tap, map, first, switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { auth } from 'firebase';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';

import { environment as env } from '../environments/environment';
import {
  Meeting,
  Book,
  Chapter,
  BookListItem,
  Verse,
  Reference,
  FromUser
} from './interfaces';
@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  meeting$: Observable<Meeting[]>;
  loading: string[] = [];

  get user() {
    return this.afAuth.user.pipe(shareReplay(1));
  }

  constructor(
    private db: AngularFirestore,
    private http: HttpClient,
    public afAuth: AngularFireAuth
  ) {
    this.meeting$ = this.db
      .collection<Meeting>('meetings', ref => ref.orderBy('id', 'desc'))
      .valueChanges();
  }

  fetchBook(bookName: string): Observable<Book> {
    return this.http.jsonp(`${env.bible.host}${bookName}`, 'getbible').pipe(
      map(book => this.mapResponseToBook(book)),
      tap((book: Book) => this.saveBookToFireStore(book))
    );
  }

  mapResponseToBook(response): Book {
    return {
      ...response,
      book: Object.keys(response['book']).map(chapter => {
        return this.mapBookToChapters(response['book'][chapter]);
      })
    };
  }

  mapBookToChapters(chapter) {
    return {
      ...chapter,
      chapter: Object.keys(chapter.chapter).map(verse => {
        return chapter.chapter[verse];
      })
    };
  }

  saveBookToFireStore(book: Book) {
    if (this.user) {
      const bookName = book.book_name.replace(/\s/g, '');
      this.db
        .collection('books')
        .doc(bookName)
        .set(book);
    }
  }

  addVerses(passage: string) {
    this.user.pipe(first()).subscribe(user => {
      if (user && user.email) {
        return empty();
      }
      this.db
        .collection('messages')
        .doc(user.email)
        .set({ email: user.email, passage: passage });
    });
  }

  getBook(bookName): Observable<Book> {
    return this.db
      .collection('books')
      .doc<Book>(bookName)
      .valueChanges()
      .pipe(
        shareReplay(1),
        map(book => this.mapResponseToBook(book))
      );
  }

  getChapter(book_name: string, chapter_nr: number): Observable<Chapter> {
    return this.getBook(book_name).pipe(
      switchMap(book => {
        if (!book) {
          return this.fetchFromAPI(`${book_name}`).pipe(
            tap(bookFromAPI => this.saveBookToFireStore(bookFromAPI)),
            map(bookFromAPI => this.findChapter(bookFromAPI.book, chapter_nr))
          );
        }
        const chapters: Chapter[] = book.book as Chapter[];
        const found: Chapter = this.findChapter(chapters, chapter_nr);
        return of(found);
      })
    );
  }

  getVerse(book: string, chapter: number, verse: number): Observable<Verse> {
    return this.getChapter(book, chapter).pipe(
      map(c => c.chapter.find(v => v.verse_nr === verse))
    );
  }

  findChapter(chapters: Chapter[], chapter_nr: number): Chapter {
    return chapters.find(chapter => chapter.chapter_nr === chapter_nr);
  }

  getFromUser(email: string): Observable<FromUser> {
    return this.db
      .collection('from-users')
      .doc<FromUser>(email)
      .valueChanges();
  }

  sendVerses(ref: Reference) {
    this.user
      .pipe(
        first(),
        switchMap(user => this.getFromUser(user.email).pipe(first()))
      )
      .subscribe(references => {
        combineLatest(
          this.user.pipe(first()),
          of(references).pipe(first())
        ).subscribe(combo => {
          const user = combo[0];
          const refs = combo[1] ? combo[1]['references'] : [];
          this.db
            .collection('from-users')
            .doc(user.email)
            .set({ email: user.email, references: [...refs, ref] });
        });
      });
  }

  removePassage(id) {
    return this.user.pipe(
      first(),
      switchMap(user => {
        if (!user || !user.email) {
          return empty();
        }
        return combineLatest(
          of(user).pipe(first()),
          this.getFromUser(user.email).pipe(first())
        );
      }),
      tap(combo => {
        this.db
          .collection('from-users')
          .doc(combo[0].email)
          .set(this.pluckPassageFromReference(combo[1], id));
      })
    );
  }

  addCommentToReference(refId: number, comment: string) {
    return this.user.pipe(
      first(),
      switchMap(user => {
        if (!user || !user.email) {
          return empty();
        }
        return combineLatest(
          of(user).pipe(first()),
          this.getFromUser(user.email).pipe(first())
        );
      }),
      tap(combo => {
        this.db
          .collection('from-users')
          .doc(combo[0].email)
          .set(this.addComment(combo[1], comment, refId));
      })
    );
  }

  addComment(fromUser: FromUser, comment: string, refId: number): FromUser {
    return {
      ...fromUser,
      references: fromUser.references.map(ref => {
        if (ref.id === refId) {
          return { ...ref, comment: comment };
        }
        return ref;
      })
    };
  }

  pluckPassageFromReference(fromUser: FromUser, id: number): FromUser {
    return {
      ...fromUser,
      references: fromUser.references.filter(ref => ref.id !== id)
    };
  }

  getBooks(): BookListItem[] {
    return [
      { id: 'Genesis', name: 'Genesis' },
      { id: 'Exodus', name: 'Êxodo' },
      { id: 'Numbers', name: 'Número' },
      { id: 'Leviticus', name: 'Levítico' },
      { id: 'Deutoronomy', name: 'Deutoronômio' },
      { id: 'Psalms', name: 'Salmos' },
      { id: 'Proverbs', name: 'Provérbios' },
      { id: 'Matthew', name: 'Mateus' },
      { id: 'Mark', name: 'Marcos' },
      { id: 'Luke', name: 'Lucas' },
      { id: 'John', name: 'João' },
      { id: 'Acts', name: 'Atos' },
      { id: 'Romans', name: 'Romanos' },
      { id: '1Corinthians', name: '1a Coríntios' },
      { id: '2Corinthians', name: '2a Coríntios' },
      { id: 'Galatians', name: 'Gálatas' },
      { id: 'Ephesians', name: 'Efésios' },
      { id: 'Philippians', name: 'Filipenses' },
      { id: 'Colossians', name: 'Colossenses' },
      { id: '1Timothy', name: '1a Timóteo' },
      { id: '2Timothy', name: '2a Timóteo' },
      { id: 'Titus', name: 'Tito' },
      { id: 'Philemon', name: 'Filemon' },
      { id: 'James', name: 'Tiago' },
      { id: '1Peter', name: '1a Pedro' },
      { id: '2Peter', name: '2a Pedro' },
      { id: '1John', name: '1a João' },
      { id: '2John', name: '2a João' },
      { id: '3John', name: '3a João' },
      { id: 'Jude', name: 'Judas' },
      { id: 'Revelation', name: 'Apocalipse' }
    ];
  }

  fetchFromAPI(bookName: string): Observable<Book> {
    return this.http
      .jsonp<Book>(`${env.bible.host}${bookName}`, 'getbible')
      .pipe(map(book => this.mapResponseToBook(book)));
  }

  login() {
    this.afAuth.auth.signInWithRedirect(new auth.GoogleAuthProvider());
  }

  logout() {
    this.afAuth.auth.signOut();
    window.location.reload();
  }
}
