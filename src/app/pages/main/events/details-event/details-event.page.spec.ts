import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsEventPage } from './details-event.page';

describe('DetailsEventPage', () => {
  let component: DetailsEventPage;
  let fixture: ComponentFixture<DetailsEventPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsEventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
