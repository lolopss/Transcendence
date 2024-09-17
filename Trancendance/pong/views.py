from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect  # Import redirect and render functions
from .forms import RegistrationForm
from django.shortcuts import render


def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('pong')  # Redirect to the Pong game page
    else:
        form = RegistrationForm()
    return render(request, 'register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')  # Safely get username
        password = request.POST.get('password')  # Safely get password
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)  # Log the user in
            return redirect('pong')  # Redirect to the Pong game page
        else:
            # Pass an error message if authentication fails
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    return render(request, 'login.html')

@login_required
def pong(request):
    return render(request, 'myfirst.html')
