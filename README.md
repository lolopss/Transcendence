# Transcendence
The final project of 42 common core

## Goal
Create a Pong website to play with friends or vs ai

![Screenshot from 2025-01-24 15-20-35](https://github.com/user-attachments/assets/9d1f5415-025a-4b1c-a0c8-3dd3d45b0af1)

### Modules

To complete this project with have to make some modules (at least 7 majors modules where 2 minors modules are equal to 1 major module)

```
Minor module: RGPD ✅ 
Minor module: Use a front-end framework or toolkit ✅ 
Minor module: Use a database for the backend ✅ 
Minor module: Expanding Browser Compatibility ✅
Minor module: Support on all devices ✅
Minor module: Multiple language supports ✅ 
Minor module: Game Customization Options ✅ (power ups)

Major module: Standard user management, authentication, users across tournaments ✅
Major module: Implementing a remote authentication ✅ 
Major module: Use a Framework for the backend ✅ 
Major module: Multiple players ✅ 
Major module: Implement Two-Factor Authentication (2FA) and JWT ✅ 
Major module: Introduce an AI Opponent ✅

9 Major + 1 Minor modules (6 Maj / 7 Min)
```

## Requirements
This project uses docker and docker-compose to works.

```bash
sudo apt-get update
sudo apt-get install docker.io -y
sudo apt-get install docker-compose -y
```

___

You will also need a .env file to put in the ./Transcendence/ folder like the following :
```env
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_user_password
POSTGRES_DB=your_db
DJANGO_SUPERUSER_USERNAME=your_admin_username
DJANGO_SUPERUSER_EMAIL=your_admin@mail.com
DJANGO_SUPERUSER_PASSWORD=your_admin_password
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret_key
REDIRECT_URI=your_url_to_redirect
API_BASE_URL=your_api_url
VITE_CLIENT_ID_42=your_vite_client_id
SECRET_KEY=your_secret_key
```
## How does it works

Firstly when you have all the requirements needed, you will have to run the project by writing **make** or **make re** in the prompt.
This will use the ```docker-compose -build``` and ```docker-compose -up``` commands to build the docker images and run them.
When this is complete you can access our ***PONG*** website with this url : https://localhost:8000

### The Game

![Screenshot from 2025-01-24 15-18-40](https://github.com/user-attachments/assets/c1c74702-6ea5-4949-86d4-b0c6cddbd0e9)

You will arrived on a **Login / Register** menu,
- if you have a 42 account you can use the ```Login with 42```
- else you have to create an account by using register and then login
- 
![Screenshot from 2025-01-17 16-09-50](https://github.com/user-attachments/assets/a2f3bad9-3b11-45c5-936d-bfef3ce03110)
![Screenshot from 2025-01-24 15-17-54](https://github.com/user-attachments/assets/c331e6c6-9ca3-4bf7-ad3f-94df1d0610d4)

___

In the main menu you can play games by going in the game menu and then choose your game type :
- Versus player (local game)
- Versus AI
- Multiplayer (2 vs 2 local game)
- Tournament (between 8 players local game)

![Screenshot from 2025-01-24 15-18-13](https://github.com/user-attachments/assets/d8aab8a9-559d-490c-96bb-a6d11e790ea8)

___

Be sure to translate the website to your convenience (French, English or Spanish).

![Screenshot from 2025-01-24 15-20-09](https://github.com/user-attachments/assets/7f0776a9-6559-4754-a933-fa0d9b477bce)

___

You can access your profile where you will see your **Stats**, **Edit your account** in the edit account tab and apply **2FA** in a Security tab
where you can also **Anonymize** or/and **Delete** your account.

![Screenshot from 2025-01-24 15-19-42](https://github.com/user-attachments/assets/13ebff4f-274c-483e-85e3-70f7e63a8826)


⚠️ **If you enable 2FA be sure to scan the QR code otherwise you wouldn't be able to connect to your account anymore**

## Specifications

This project was made by a team of 3 devs, 2 managing the backend and the game spec and 1 managing the frontend and make it as beautifull as it is now 😄

### Languages

We used :
- docker,
- django,
- react with vite + html css,
- and some JSON conf file

[![docker](https://skillicons.dev/icons?i=docker,django,html,css,js,react,vite)](https://skillicons.dev)
