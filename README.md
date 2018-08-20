# <a href="https://cribtrakr.netlify.com/" target="_blank">CribTrakr</a>
### <i>CribTrakr is an app that keeps track of your rental properties and their related expenses.This repo houses the app's API <br>
<br>

## Live Demo:
https://evening-oasis-38989.herokuapp.com/ <br>
<br>


## Technologies used: <br> 

#### Back End <br>
- Node.js (server-side scripting)<br> 
- Express (server framework and API end point routing) <br> 
- MongoDB(mLab) (database) <br> 
- Mongoose (data modeling and schema) <br>
- Mocha Chai (unit testing) <br>
- Travis CI (continuous integration and deployment) <br>
- Heroku (deployment) <br>

#### Security <br>
- Passwords are encrypted with bcryptjs <br>
- Passport.js was used as authentication middleware <br>

#### Responsive <br>
- The app is responsive and optimized for both desktop and mobile viewing and use <br>
<br>

## API Documentation :<br>

#### API endpoints <br>
- API for registering new users and checking existing user logins: <br>
	* '/api/users' - POST, GET <br>

- API for creating JWTs: <br>
	* '/api/auth' <br>
	* '/api/login' - POST <br>

- API for rental property data: <br>
	* '/api/rentals' <br>
  * '/' - GET, POST  <br>
  * '/:id' - GET, PUT, DELETE<br>

- API for expenses data: <br>
	* '/api/expenses' <br>
  * '/' - GET, POST <br>
  * '/:id' - GET, PUT, DELETE<br>
<br>

## To run locally: 
1. Clone repo locally
2. run `npm install` 
3. run mongod in a new terminal
4. run `nodemon server.js`