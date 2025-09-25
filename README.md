## Setup

This project was created for the use case of using the Embedded Query


### Frontend
Make a copy of the *.env_example* and rename it to *.env*. \
Add in your Looker instance information (hosturl will be your Looker URL). \
Run the application using *npm start*


### Backend
Make a copy of the *looker.ini_example* and rename it to *looker.ini* (The Express server will be using this information for the Looker SDK) \
Add in your Looker information such as base_url (which is the same hosturl in the Frontend section), client_id and client_secret (API keys created in Looker's Admin -> Users) \
Run the application using *npm start*
