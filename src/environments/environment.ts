// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  firebaseConfig: {
    apiKey: "AIzaSyBDi6Fe8bb1ygWM5JGgWogrJ-8p6gAm1bI",
    authDomain: "appeventos-6bbfc.firebaseapp.com",
    databaseURL: "https://appeventos-6bbfc-default-rtdb.firebaseio.com",
    projectId: "appeventos-6bbfc",
    storageBucket: "appeventos-6bbfc.firebasestorage.app",
    messagingSenderId: "776437198981",
    appId: "1:776437198981:web:0b397e16101f10acf2f9ec"
  },
  apiUrl: 'https://student-events-api.onrender.com/api'
  //apiUrl: 'http://localhost:8080/api'

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
