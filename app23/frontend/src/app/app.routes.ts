import { Routes,RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MapsNearRoomsComponent } from './pages/maps-near-rooms/maps-near-rooms.component';
// import { AddNewPostComponent } from './pages/add-new-post/add-new-post.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';

// Route config let's you map routes to components
const routes: Routes = [
    {
      path: 'login',
      component: LoginComponent 
    },

    {
      path: 'profile',
      component: ProfileComponent 
    },

    {
      path: '',
      component: MapsNearRoomsComponent 
    },

    {
      path: 'maps',
      component: MapsNearRoomsComponent 
    },

    // {
    //   path: 'post',
    //   component: AddNewPostComponent 
    // },
    {
      path: 'myprofile',
      component: MyProfileComponent 
    }
  ];

export const routing = RouterModule.forRoot(routes);