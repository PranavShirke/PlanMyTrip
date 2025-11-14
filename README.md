🌎 PlanMyTrip
Developed an AI-powered travel planner that generates custom, day-by-day itineraries based on user preferences. The system integrates real-time weather data to suggest appropriate activities and features interactive mapping to simplify navigation and visualize the journey.

## 🧳 Features

- 🔐 **Clerk Authentication** – Secure user login and signup
- 📍 **Destination Input** – Choose your location and travel duration
- 🎯 **Interest Selection** – Select from nature, culture, food, and more
- 🧠 **AI Itinerary Generation** – Uses Gemini API to generate smart day-wise plans
- 🌦️ **Weather Forecasting** – Forecast shown for your trip period
- 🗺️ **Map Integration** – View itinerary locations as map pins with Leaflet.js
- 💾 **Save & View Trips** – Store and retrieve past itineraries (MongoDB)
- 🗓️ **Interactive Calendar** – Built-in calendar picker for start and end dates
- 💅 **Stunning UI** – Built with Tailwind CSS and ShadCN UI components

## 🧰 Tech Stack

| Category       | Tools / Frameworks                       |
|----------------|------------------------------------------|
| Frontend       | React.js, Tailwind CSS, ShadCN UI        |
| Backend        | Node.js, Express.js                      |
| Authentication | Clerk.dev                                |
| AI Engine      | Google Gemini API                        |
| Map            | Leaflet.js                               |
| Weather API    | Open-Meteo (or Tomorrow.io alternative)  |
| Database       | MongoDB + Mongoose                       |
| Date Picker    | React Calendar                           |


PlanMyTrip/
│
├── frontend/              # UI code  
│   ├── src/  
│   └── public/  
├── backend/               # API & server code  
│   ├── controllers/  
│   ├── models/  
│   ├── routes/  
│   └── server.js  
├── README.md              
└── .gitignore             


▶️ How to Install & Run
1. Clone the repo
git clone https://github.com/PranavShirke/PlanMyTrip.git
cd PlanMyTrip

2. Setup backend
cd backend
npm install        # or yarn install
# create .env with your DB_URI, secret keys etc.
npm start

3. Setup frontend
cd ../frontend
npm install
npm start           # runs in dev mode, usually at http://localhost:3000

4. Use the app
Open your browser → navigate to frontend URL.
Sign up / login, create a trip, explore destinations.

👤 Author
Pranav Shirke
GitHub: https://github.com/PranavShirke
