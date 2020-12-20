import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmBuybacksDialogComponent } from './farm-buybacks-dialog.component';

describe('FarmBuybacksDialogComponent', () => {
  let component: FarmBuybacksDialogComponent;
  let fixture: ComponentFixture<FarmBuybacksDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmBuybacksDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmBuybacksDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
