import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BiblePage } from './bible.page';

describe('BiblePage', () => {
  let component: BiblePage;
  let fixture: ComponentFixture<BiblePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiblePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiblePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
