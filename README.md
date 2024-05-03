porta 3052
porta 3051
porta 8501


#########instalação evolution 

git clone https://github.com/DAVIAMERICO242/evolution_api ##ou pegar desse repositorio (DEVE CONFIGURAR O ENV PRA NAO DELETAR OS CONTATOS DEPOIS DE 7200 SEG)

cd evolution-api
npm install

cp src/dev-env.yml src/env.yml
nano src/env.yml

nano src/env.yml alterar porta e token de cordo com o BACKEND

npm run start:prod

pm2 start "npm start" --name "ApiEvolution"


#############instalar meu Backend
cd backend
npm i
npm start##produção: pm2 start

##########frontend 
npm run dev##produção: npm run build

##e jogar a dist no nginx site estatico em caso de produção

#############PRODUÇÃO########
DEVE TER 4 SUBDOMINIOS, PRO BACKEND,FRONTEND,WEBSOCKET E API DO WHATSAPP, TODOS APONTADOS PARA O ENDEREÇO PURO DO SERVIDOR NAO PORTA

##################CONFIGURAÇÕES NGINX PRA PRODUÇÃO
############FRONTEND:

server {
  listen 80;
  listen [::]:80;
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  {{ssl_certificate_key}}
  {{ssl_certificate}}
  server_name app.skyler.com.br;
  {{root}}

  {{nginx_access_log}}
  {{nginx_error_log}}

  if ($scheme != "https") {
    rewrite ^ https://$host$uri permanent;
  }

  location ~ /.well-known {
    auth_basic off;
    allow all;
  }

  {{settings}}

  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location ~* ^.+\.(css|js|jpg|jpeg|gif|png|ico|gz|svg|svgz|ttf|otf|woff|woff2|eot|mp4|ogg|ogv|webm|webp|zip|swf)$ {
    add_header Access-Control-Allow-Origin "*";
    expires max;
    access_log off;
  }

  if (-f $request_filename) {
    break;
  }
}

###################BACKEND
server {
  listen 80;
  listen [::]:80;
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  {{ssl_certificate_key}}
  {{ssl_certificate}}
  server_name disp-api.skyler.com.br;
  {{root}}

  {{nginx_access_log}}
  {{nginx_error_log}}

  if ($scheme != "https") {
    rewrite ^ https://$host$uri permanent;
  }

  location @reverse_proxy {
    proxy_pass {{reverse_proxy_url}};
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass_request_headers on;
    proxy_max_temp_file_size 0;
    proxy_connect_timeout 900;
    proxy_send_timeout 900;
    proxy_read_timeout 900;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    proxy_temp_file_write_size 256k;
  }

  {{settings}}

  add_header Cache-Control no-transform;

  index index.html;

  location ^~ /.well-known {
    auth_basic off;
    allow all;
    try_files $uri @reverse_proxy;
  }

  location / {
    try_files $uri @reverse_proxy;
  }
}

###############API WHATSAPP:

server {
  listen 80;
  listen [::]:80;
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  {{ssl_certificate_key}}
  {{ssl_certificate}}
  server_name wpp-api.skyler.com.br;
  {{root}}

  {{nginx_access_log}}
  {{nginx_error_log}}

  if ($scheme != "https") {
    rewrite ^ https://$host$uri permanent;
  }

  location @reverse_proxy {
    proxy_pass {{reverse_proxy_url}};
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass_request_headers on;
    proxy_max_temp_file_size 0;
    proxy_connect_timeout 900;
    proxy_send_timeout 900;
    proxy_read_timeout 900;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    proxy_temp_file_write_size 256k;
  }

  {{settings}}

  add_header Cache-Control no-transform;

  index index.html;

  location ^~ /.well-known {
    auth_basic off;
    allow all;
    try_files $uri @reverse_proxy;
  }

  location / {
    try_files $uri @reverse_proxy;
  }
}

#########WEBSOCKET

server {
  listen 80;
  listen [::]:80;
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  {{ssl_certificate_key}}
  {{ssl_certificate}}
  server_name wpp-socket.skyler.com.br;
  {{root}}

  {{nginx_access_log}}
  {{nginx_error_log}}

  if ($scheme != "https") {
    rewrite ^ https://$host$uri permanent;
  }

  location @reverse_proxy {
    proxy_pass {{reverse_proxy_url}};
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass_request_headers on;
    proxy_max_temp_file_size 0;
    proxy_connect_timeout 900;
    proxy_send_timeout 900;
    proxy_read_timeout 900;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    proxy_temp_file_write_size 256k;
  }

  {{settings}}

  add_header Cache-Control no-transform;

  index index.html;

  location ^~ /.well-known {
    auth_basic off;
    allow all;
    try_files $uri @reverse_proxy;
  }

  location / {
    try_files $uri @reverse_proxy;
  }
}



