#!/bin/bash

echo "Installing..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

nvm install --lts
npm install react-router-dom
echo "Installed Complete"
