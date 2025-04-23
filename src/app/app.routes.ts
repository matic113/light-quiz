import { TeacherComponent } from './groups/teacher/teacher.component';
import { LoginComponent } from './auth/login/login.component';
import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { CreateNewExamComponent } from './question/create-new-exam/create-new-exam.component';
import { EnterQuestionsComponent } from './question/enter-questions/enter-questions.component';
import { ReviewComponent } from './question/review/review.component';
import { ExamInformationComponent } from './question/exam-information/exam-information.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { QuizComponent } from './quiz/quiz.component';
import { TakeQuizComponent } from './take-quiz/take-quiz.component';
import { ResultsComponent } from './results/results.component';
import { roleGuard } from './guards/role.guard';
import { QuizzesComponent } from './quizzes/quizzes.component';
import { StudentComponent } from './groups/student/student.component';

export const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      // Routes خاصة بالمدرس فقط
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [roleGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'create',
        component: CreateNewExamComponent,
        canActivate: [roleGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'enter',
        component: EnterQuestionsComponent,
        canActivate: [roleGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'review',
        component: ReviewComponent,
        canActivate: [roleGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'info',
        component: ExamInformationComponent,
        canActivate: [roleGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'quizzes',
        component: QuizzesComponent,
        canActivate: [roleGuard],
        data: { role: 'teacher' },
      },
      {
        path: 't-groups',
        component: TeacherComponent,
        canActivate: [roleGuard],
        data: { role: 'teacher' },
      },

      // Routes خاصة بالطالب فقط
      {
        path: 'quiz',
        component: QuizComponent,
        canActivate: [roleGuard],
        data: { role: 'student' },
      },
      {
        path: 'take-quiz/:quizId',
        component: TakeQuizComponent,
        canActivate: [roleGuard],
        data: { role: 'student' },
      },
      {
        path: 'results',
        component: ResultsComponent,
        canActivate: [roleGuard],
        data: { role: 'student' },
      },
      
      {
        path: 's-groups',
        component: StudentComponent,
        canActivate: [roleGuard],
        data: { role: 'student' },
      },

      // Not found
      { path: '**', component: NotFoundComponent },
    ],
  },
];