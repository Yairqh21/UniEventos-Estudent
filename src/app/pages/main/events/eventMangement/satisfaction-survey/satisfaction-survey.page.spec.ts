import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SatisfactionSurveyPage } from './satisfaction-survey.page';

describe('SatisfactionSurveyPage', () => {
  let component: SatisfactionSurveyPage;
  let fixture: ComponentFixture<SatisfactionSurveyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SatisfactionSurveyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
