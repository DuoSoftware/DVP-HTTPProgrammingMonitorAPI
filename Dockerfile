FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-HTTPProgrammingMonitorAPI.git /usr/local/src/httpprogrammingmonitorapi
RUN cd /usr/local/src/httpprogrammingmonitorapi; npm install
CMD ["nodejs", "/usr/local/src/httpprogrammingmonitorapi/app.js"]

EXPOSE 8813