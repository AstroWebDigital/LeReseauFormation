FROM postgres:17-alpine

ENV POSTGRES_DB=lr_db \
    POSTGRES_USER=lr_user \
    POSTGRES_PASSWORD=lr_password

COPY init /docker-entrypoint-initdb.d
