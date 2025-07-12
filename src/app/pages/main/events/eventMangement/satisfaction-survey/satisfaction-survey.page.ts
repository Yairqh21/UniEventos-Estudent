import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Answer } from 'src/app/models/answer.model';
import { Question } from 'src/app/models/question.model';
import { SurveyModel } from 'src/app/models/survey.model';
import { AuthService } from 'src/app/services/auth.service';
import { SurveyService } from 'src/app/services/survey.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-satisfaction-survey',
  templateUrl: './satisfaction-survey.page.html',
  styleUrls: ['./satisfaction-survey.page.scss'],
})
export class SatisfactionSurveyPage {

  eventId: string = 'NvQMSrsRb9O2awUpXcIy';
  userId: string = '';
  surveyForm: FormGroup;
  survey: SurveyModel;
  questions: Question[] = [];
  evntNAme: string = '';
  contentLoaded: boolean = false;
  isSaving: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private surveysService: SurveyService,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.surveyForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.eventId = params['eventId'] || '';

      this.getSurveyActivated();
      this.userId = this.authService.currentUser().id;
    });
  }


  async getSurveyActivated() {
    try {
      const survey: SurveyModel | undefined = await this.surveysService.getByEventId(this.eventId).toPromise();

      if (!survey) {
        this.utilsService.toast('Este evento no tiene encuestas activadas', 'bottom', 2000, 'warning');
        this.router.navigate(['/main/home']);
      } else {
        this.survey = survey;
        this.questions = survey.questions;

        // Inicializar el formulario dinámicamente
        for (const question of this.questions) {
          if (question.questionType === 'multiple') {
            this.surveyForm.addControl(question.id, new FormControl([]));
          } else {
            this.surveyForm.addControl(question.id, new FormControl('', Validators.required));
          }
        }
        this.contentLoaded = true;
      }
    } catch (error) {
      console.error('Error fetching surveys', error);
      throw error;
    }
  }


  createFormControls() {
    const formControls: { [key: string]: any } = {};

    this.questions.forEach(question => {
      if (question.questionType === 'multiple') {
        // Para checkboxes, necesitamos un FormArray
        formControls[question.id] = this.formBuilder.array(
          question.options.map(() => false)
        );
      } else {
        // Para radios y textareas, un simple FormControl
        formControls[question.id] = ['', Validators.required];
      }
    });

    this.surveyForm = this.formBuilder.group(formControls);
  }
  onCheckboxChange(event: any, questionId: string) {
    const selectedOptions = this.surveyForm.get(questionId)?.value || [];
    if (event.target.checked) {
      selectedOptions.push(event.target.value);
    } else {
      const index = selectedOptions.indexOf(event.target.value);
      if (index !== -1) {
        selectedOptions.splice(index, 1);
      }
    }
    this.surveyForm.get(questionId)?.setValue(selectedOptions);
    this.surveyForm.get(questionId)?.markAsDirty();
  }


  saveSurvey() {
    if (this.isSaving) return;
    this.isSaving = true;

    this.utilsService.presentLoading('Enviando encuesta...').then(loading => {
      const answers: Answer = {
        surveyId: this.survey.id,
        eventId: this.eventId,
        userId: this.userId,
        answers: []
      };

      for (const question of this.questions) {
        const questionId = question.id;
        if (questionId) {
          const value = this.surveyForm.get(questionId)?.value;
          const answerValue = Array.isArray(value) ? value.join(', ') : value;
          answers.answers?.push({ questionId: questionId, answer: answerValue });
        }
      }

      this.surveysService.saveSurveyAnswer(answers, this.survey.id).subscribe({
        next: async () => {
          this.utilsService.toast('Encuesta enviada correctamente', 'bottom', 2000, 'success');
          await this.router.navigate(['/main/home']);
          loading.dismiss();
          this.isSaving = false;
        },
        error: async (error) => {
          console.error('Error saving survey answers:', error);
          this.utilsService.toast('Error al enviar la encuesta', 'bottom', 2000, 'danger');
          loading.dismiss();
          this.isSaving = false;
        }
      });
    });
  }
}
