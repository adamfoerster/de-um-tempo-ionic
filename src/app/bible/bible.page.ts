import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { ServiceService } from '../service.service';
import { Chapter, BookListItem, Verse, Reference } from '../interfaces';

@Component({
  selector: 'app-bible',
  templateUrl: './bible.page.html',
  styleUrls: ['./bible.page.scss']
})
export class BiblePage implements OnInit {
  passage$: Observable<Chapter>;
  chapter$: Observable<Chapter[]>;
  books: BookListItem[] = [];
  selectedChapter = 103;
  selectedVerses: Verse[] = [];
  selectedBook = 'Psalms';

  constructor(public service: ServiceService) {}

  ngOnInit() {
    this.read(this.selectedBook);
    this.books = this.service.getBooks();
  }

  ev(e) {
    console.log(e);
  }

  read(bookName) {
    this.selectedBook = bookName;
    this.resetVerses();
    this.chapter$ = this.service.getBook(bookName).pipe(map(book => book.book));
    this.passage$ = this.service.getChapter(bookName, this.selectedChapter);
  }

  select(verse) {
    if (this.isSelected(verse)) {
      this.selectedVerses = this.selectedVerses.filter(
        v => v.verse_nr !== verse
      );
    } else {
      this.service
        .getVerse(this.selectedBook, this.selectedChapter, verse)
        .pipe(first())
        .subscribe(vrs => this.selectedVerses.push(vrs));
    }
  }

  resetVerses() {
    this.selectedVerses = [];
  }

  isSelected(verse) {
    return !!this.selectedVerses.find(v => v.verse_nr === verse);
  }

  sendVerses() {
    this.service.sendVerses(this.mapToReference());
    this.resetVerses();
  }

  sortVerses(curr: Verse, prev: Verse): number {
    if (curr.verse_nr <= prev.verse_nr) {
      return -1;
    }
    return 1;
  }

  mapToReference(): Reference {
    const verses = this.selectedVerses.sort(this.sortVerses);
    return {
      book: this.selectedBook,
      chapter: this.selectedChapter,
      reference: this.versesToText(verses),
      verses: verses
    } as Reference;
  }

  versesToText(verses: Verse[]): string {
    return [
      `${this.selectedBook} ${this.selectedChapter} <br />`,
      ...verses.map(verse => `${verse.verse_nr} ${verse.verse} `)
    ].join('');
  }
}
