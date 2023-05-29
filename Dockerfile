FROM ubuntu:18.04
MAINTAINER ICT KMITL "sukhum_butrkam@hotmail.com"

# Base ####################
# update packages
RUN apt-get update
RUN apt-get update --fix-missing

# install required libraries
RUN apt-get install -y gcc
RUN apt-get install -y python3 python3-dev python3-setuptools
RUN apt-get install -y libpq-dev
RUN apt-get install -y nginx
RUN apt-get install -y wget

# install pip
RUN wget https://bootstrap.pypa.io/get-pip.py
RUN python3 get-pip.py
RUN rm get-pip.py

###########################
RUN apt-get update
RUN apt-get update --fix-missing
# RUN apt-get -y -f install libmysqlclient-dev
# Application #############

RUN export LANG=C.UTF-8
RUN export LANG=en_US.UTF-8 
RUN export PYTHONIOENCODING=UTF-8

COPY requirements.txt /app/requirements.txt
WORKDIR /app


RUN pip install -r requirements.txt
RUN rm requirements.txt
COPY ./application /app

RUN python3 manage.py collectstatic --noinput

# expose ports
EXPOSE 8000
CMD ["/usr/local/bin/gunicorn", "application.wsgi:application", "-w", "2", "-b", ":8000", "--reload"]