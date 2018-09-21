import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassagesPage } from './passages.page';

describe('PassagesPage', () => {
  let component: PassagesPage;
  let fixture: ComponentFixture<PassagesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassagesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
