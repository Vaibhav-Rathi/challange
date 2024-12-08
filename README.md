
step1 : Clone the repo ( git clone https://github.com/Vaibhav-Rathi/challange.git )

BACKEND STARTUP
step2 : cd backend and ( npm install ) in backend folder
step3 : create .env file in backend folder and put ( DATABASE_URL=YOUR_MONGODB_CLUSTER_URL ) and (BASE_URL="http://localhost:3000")
step4 : run ( tsc -b ) and ( node dist/server.js ) 
step5 : To enter the seed data in the database send a request on ( http://localhost:3000/enterData ) once.

FRONTEND STARTUP
step6 : cd frontend and ( npm install ) in frontend folder
step6 : create .env file in frontend and put ( VITE_BASE_URL=http://localhost:3000/ )
step7 : run npm dev

step8 : Check all the functionalities that were mentioned in the assignment, if found any bug or malfunctioning then please return the feedback.