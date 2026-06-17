import { TestBed } from '@angular/core/testing';

import { ModuleAccess } from './module-access';

describe('ModuleAccess', () => {
  let service: ModuleAccess;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModuleAccess);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
