## Cómo correr en local

### Front

- Crear `.env.local` con lo siguiente:
```
AUTH0_SECRET='e68278ea73c6cf442e2e4ef87ad442ce1c78076056372a4bb5dca171dabb1e7a'
AUTH0_CLIENT_SECRET='5yYyQL64mbIMjcQHdXnXnRFWv17wzOrEOVB5R-sT-emR1oTE49DUN6ZyPS7DG-XZ'
AUTH0_SCOPE='openid profile email read:shows update:users'
```

Luego ejecutar:

- yarn install
- yarn run dev


## Back 

- En folder api crear `.env` 
```
POSTGRES_PORT=5432
POSTGRES_DB=arquisys_db
POSTGRES_PASSWORD=Arquisys_2001
POSTGRES_USER=nicolas_olmos
HOST=students:iic2173-2023-2-students@broker.legit.capital
PORT=9000
AUTH0_SECRET='e68278ea73c6cf442e2e4ef87ad442ce1c78076056372a4bb5dca171dabb1e7a'
AUTH0_ISSUER_BASE_URL='https://dev-c6qwwrh4suoknli2.us.auth0.com'
AUTH0_CLIENT_ID='3U13tKK65n8K0Hc3kfJfdIn73Fiu08kJ'
AUTH0_CLIENT_SECRET='5yYyQL64mbIMjcQHdXnXnRFWv17wzOrEOVB5R-sT-emR1oTE49DUN6ZyPS7DG-XZ'
```

- En folder listener crear `.env` 
```
HOST=students:iic2173-2023-2-students@broker.legit.capital
PORT=9000
```

- el resto de pasos se indica en el [README.md del back](https://github.com/NicolasOlmosQuiroga/Backend_E1-2023-2-Grupo28/tree/master).
