import { LoginComponent } from './auth/login/login.component';
import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { CreateNewExamComponent } from './question/create-new-exam/create-new-exam.component';
import { EnterQuestionsComponent } from './question/enter-questions/enter-questions.component';
import { ReviewComponent } from './question/review/review.component';
import { ExamInformationComponent } from './question/exam-information/exam-information.component';
import { RegisterComponent } from './auth/register/register.component';
import { StudentComponent } from './student/student.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
   // Redirecting the root path '' to 'login' to ensure the app starts with the login page
   { path: '', redirectTo: 'create', pathMatch: 'full' },

   // Public routes that do not require authentication (login and register pages)
   { path: 'login', component: LoginComponent },
   { path: 'register', component: RegisterComponent },
 
   // Root path protection, applying AuthGuard to all child routes
   {
     path: '',
     canActivate: [authGuard],  // Adding AuthGuard to all child routes
     children: [
       { path: 'dashboard', component: DashboardComponent },  // Protected route
       { path: 'create', component: CreateNewExamComponent },  // Protected route
       { path: 'enter', component: EnterQuestionsComponent },  // Protected route
       { path: 'review', component: ReviewComponent },  // Protected route
       { path: 'info', component: ExamInformationComponent },  // Protected route
       { path: 'student/:quizId', component: StudentComponent },  // Protected route
       { path: '**', component: NotFoundComponent }

     ]
   },
];
