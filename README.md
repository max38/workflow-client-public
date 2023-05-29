### For develop client
npm run dev

### Install 
1. make virtaulenv for this project
2. pip install -r requirements.txt
3. sudo docker-compose build
4. sudo docker-compose up
5. cd application
6. python manage.py migrate
7. python manage.py createsuperuser

GO TO 
- 127.0.0.1:8000/admin/
- 127.0.0.1:8000/workflow/dashboard


### Running for development step
$ sudo docker-compose up
$ python manage.py runserver
$ celery -A application worker -l info

####

npm install --save-dev --ignore-scripts install-peers