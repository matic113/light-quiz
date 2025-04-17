import { LoginComponent } from './auth/login/login.component';
import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { CreateNewExamComponent } from './question/create-new-exam/create-new-exam.component';
import { EnterQuestionsComponent } from './question/enter-questions/enter-questions.component';
import { ReviewComponent } from './question/review/review.component';
import { ExamInformationComponent } from './question/exam-information/exam-information.component';
import { RegisterComponent } from './auth/register/register.component';
import { StudentComponent } from './student/student.component';

export const routes: Routes = [
  // Redirect from the root path '' to 'create' to ensure the app starts with the create page
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'create', component: CreateNewExamComponent },
  { path: 'enter', component: EnterQuestionsComponent },
  { path: 'review', component: ReviewComponent },
  { path: 'info', component: ExamInformationComponent },
  { path: 'student/:quizId', component: StudentComponent },
  // Catch-all route for undefined paths, displaying the NotFoundComponent (404 error page)
  { path: "**", component: NotFoundComponent }
];
