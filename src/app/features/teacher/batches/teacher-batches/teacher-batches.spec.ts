import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherBatches } from './teacher-batches';

describe('TeacherBatches', () => {
  let component: TeacherBatches;
  let fixture: ComponentFixture<TeacherBatches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherBatches],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherBatches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
