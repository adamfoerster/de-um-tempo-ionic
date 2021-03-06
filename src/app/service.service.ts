import { AngularFireStorage } from '@angular/fire/storage';
import { Injectable } from '@angular/core';
import {
  Observable,
  of,
  combineLatest,
  Subject,
  from,
  BehaviorSubject
} from 'rxjs';
import {
  shareReplay,
  tap,
  map,
  first,
  switchMap
} from 'rxjs/operators';
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
  FromUser,
  Photos
} from './interfaces';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  _meeting = new BehaviorSubject([]);
  selectedPhoto$: Subject<string> = new Subject();
  loading: string[] = [];
  memo = [];
  lastMeetingDoc;

  get meeting$() {
    return this._meeting.asObservable().pipe(
      map(meets => {
        this.memo = [...this.memo, ...meets];
        return this.memo;
      })
    );
  }

  get user() {
    return this.afAuth.user.pipe(shareReplay(1));
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }

  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private http: HttpClient,
    public afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.selectedPhoto$.subscribe(console.log);

    this.afAuth.authState.subscribe(user => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        localStorage.setItem('user', null);
      }
    });
  }

  mapWithRef(i) {
    const data = i.payload.doc.data();
    return { ref: i.payload.doc, ...data };
  }

  postMeeting(meeting: Meeting) {
    console.log(meeting);
    return this.db
      .collection('meetings')
      .doc(meeting.id.toString())
      .set(meeting);
  }

  loadMeetings(docref: string = null) {
    if (!docref) {
      return this.db
        .collection<Meeting>('meetings', ref =>
          ref.orderBy('id', 'desc').limit(3)
        )
        .snapshotChanges()
        .pipe(
          first(),
          map(items => items.map(i => this.mapWithRef(i)))
        )
        .subscribe(m => this._meeting.next(m));
    }
    return this.db
      .collection<Meeting>('meetings', ref =>
        ref
          .orderBy('id', 'desc')
          .startAfter(docref)
          .limit(3)
      )
      .snapshotChanges()
      .pipe(
        first(),
        map(items => items.map(i => this.mapWithRef(i)))
      )
      .subscribe(m => this._meeting.next(m));
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
        return of([]);
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
        switchMap(book => {
          if (!book) {
            return this.fetchFromAPI(`${bookName}`).pipe(
              tap(bookFromAPI => this.saveBookToFireStore(bookFromAPI))
            );
          }
          return of(book);
        }),
        map(book => this.mapResponseToBook(book))
      );
  }

  getChapter(book_name: string, chapter_nr: number): Observable<Chapter> {
    return this.getBook(book_name).pipe(
      map(book => {
        const chapters: Chapter[] = book.book as Chapter[];
        const found: Chapter = this.findChapter(chapters, chapter_nr);
        return found;
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

  getFromUserAdmin(): Observable<FromUser[]> {
    return this.db.collection<FromUser>('from-users').valueChanges();
  }

  getAdminUsers(): Observable<string[]> {
    return this.db.collection<string>('admins').valueChanges();
  }

  isAdmin(email: string): Observable<boolean> {
    return this.db
      .collection('admins')
      .doc(email)
      .valueChanges()
      .pipe(
        map(res => !!res),
        first()
      );
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
          return of([]);
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
          return of([]);
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
      { id: 'Deuteronomy', name: 'Deutoronômio' },
      { id: 'Joshua', name: 'Josué' },
      { id: 'Judges', name: 'Juízes' },
      { id: 'Ruth', name: 'Rute' },
      { id: '1Samuel', name: '1o Samuel' },
      { id: '2Samuel', name: '2o Samuel' },
      { id: '1Kings', name: '1o Reis' },
      { id: '2Kings', name: '2o Reis' },
      { id: '1Chronicles', name: '1o Crônicas' },
      { id: '2Chronicles', name: '2o Crônicas' },
      { id: 'Ezra', name: 'Esdras' },
      { id: 'Nehemiah', name: 'Neemias' },
      { id: 'Esther', name: 'Estér' },
      { id: 'Job', name: 'Jó' },
      { id: 'Psalms', name: 'Salmos' },
      { id: 'Proverbs', name: 'Provérbios' },
      { id: 'Ecclesiastes', name: 'Eclesiastes' },
      { id: 'SongofSongs', name: 'Cantares' },
      { id: 'Isaiah', name: 'Isaías' },
      { id: 'Jeremiah', name: 'Jeremias' },
      { id: 'Lamentations', name: 'Lamentações' },
      { id: 'Ezekiel', name: 'Ezequiel' },
      { id: 'Daniel', name: 'Daniel' },
      { id: 'Hosea', name: 'Oséias' },
      { id: 'Joel', name: 'Joel' },
      { id: 'Amos', name: 'Amós' },
      { id: 'Obadiah', name: 'Obadias' },
      { id: 'Jonah', name: 'Jonas' },
      { id: 'Micah', name: 'Miquéias' },
      { id: 'Nahum', name: 'Naum' },
      { id: 'Habakkuk', name: 'Habacuque' },
      { id: 'Zephaniah', name: 'Sofonias' },
      { id: 'Haggai', name: 'Ageu' },
      { id: 'Zechariah', name: 'Zacarias' },
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
      { id: '1Thessalonians', name: '1a Tessalonicenses' },
      { id: '2Thessalonians', name: '2a Tessalonicenses' },
      { id: '1Timothy', name: '1a Timóteo' },
      { id: '2Timothy', name: '2a Timóteo' },
      { id: 'Titus', name: 'Tito' },
      { id: 'Philemon', name: 'Filemon' },
      { id: 'Hebrews', name: 'Hebreus'},
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

  getBookPt(bookEn): string {
    return this.getBooks().find(b => b.id === bookEn).name;
  }

  fetchFromAPI(bookName: string): Observable<Book> {
    return this.http
      .jsonp<Book>(`${env.bible.host}${bookName}`, 'getbible')
      .pipe(map(book => this.mapResponseToBook(book)));
  }

  getPhotos(): Observable<Photos> {
    return this.user.pipe(
      switchMap(user =>
        this.db
          .collection('photos')
          .doc<Photos>(user.email)
          .valueChanges()
      )
    );
  }

  getPhotoUrl(photo: string): Observable<string> {
    return this.storage
      .ref(photo)
      .getDownloadURL()
      .pipe(first());
  }

  saveFile(filePath, file) {
    const ref = this.storage.ref(`photos/${filePath}`);
    return from(ref.put(file).task).pipe(
      switchMap(_ => this.user),
      first(),
      switchMap(user =>
        combineLatest(
          this.db
            .collection('photos')
            .doc<Photos>(user.email)
            .valueChanges(),
          of(user.email)
        )
      ),
      first(),
      switchMap(([photos, email]) => {
        if (!photos) {
          return this.db
            .collection('photos')
            .doc(email)
            .set({
              email,
              photos: [`photos/${filePath}`]
            });
        }
        return this.db
          .collection('photos')
          .doc<Photos>(photos.email)
          .set({
            ...photos,
            photos: [...photos.photos, `photos/${filePath}`]
          });
      }),
      first()
    );
  }

  loginGoogle() {
    this.afAuth.auth.signInWithRedirect(new auth.GoogleAuthProvider());
  }

  async logout() {
    await this.afAuth.auth.signOut();
    localStorage.removeItem('user');
    this.router.navigate(['login']);
  }

  async login(email: string, password: string) {
    const result = await this.afAuth.auth.signInWithEmailAndPassword(
      email,
      password
    );
    this.router.navigate(['/']);
  }

  async register(email: string, password: string) {
    const result = await this.afAuth.auth.createUserWithEmailAndPassword(
      email,
      password
    );
    this.sendEmailVerification();
  }

  async sendEmailVerification() {
    await this.afAuth.auth.currentUser.sendEmailVerification();
    this.router.navigate(['login']);
  }

  async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail);
  }
}
