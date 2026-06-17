import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherResults } from './teacher-results';

describe('TeacherResults', () => {
  let component: TeacherResults;
  let fixture: ComponentFixture<TeacherResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherResults],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherResults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
