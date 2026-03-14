#!/bin/sh

python manage.py migrate --no-input
python manage.py collectstatic --no-input

gunicorn hrms_project.wsgi:application --bind 0.0.0.0:8080 --workers 2 --threads 4 --timeout 60