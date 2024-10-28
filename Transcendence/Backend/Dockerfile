FROM python:3.8

RUN mkdir /app

COPY ./Backend /app/back-end
WORKDIR /app/back-end

RUN apt-get update \
	&& apt-get install -y --no-install-recommends postgresql-client\
	&& rm -rf /var/lib/apt/lists/*

RUN  pip install --upgrade pip \
	&& pip install -r requirements.txt

EXPOSE 8000

CMD  python manage.py collectstatic --noinput && python3 manage.py makemigrations && python3 manage.py migrate && daphne -b 0.0.0.0 -p 8000 Transcendence.asgi:application