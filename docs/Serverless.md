
# Serverless

El servicio de boletas consta de:

* Un archivo ```handler.py```, que contiene toda la logica de la lambda function
* Un archivo ```serverless.yml```, que contiene configuracion
* Una capa de librerias en un zip, ```lib.zip```

# Requisitos

* Instalar serverless
* Configurar credenciales de AWS

# Pasos para subir

  1 - Aplicar la configuración adecuada en ```serverless.yml```, se necesita establecer el runtime adecuado, configurar permisos de S3, y el handler.

Runtime
```
provider:
  name: aws
  runtime: python3.10
```

Para S3 (dentro de configuracion iam):
```
- Effect: "Allow"
          Action:
            - 's3:GetObject'
            - 's3:PutObject'
          Resource:
            - 'arn:aws:s3:::bucket-boletas*'
```
Handler:
```
functions:
  hello:
    handler: handler.boleta
```

2 - Se debe "pushear" el codgio, mediante el comando ```sls deploy```, se puede stablecer un stage como ```sls deploy --stage demo```

3 - Se necesita subir el archivo ```lib.zip``` como una capa personalizada a la lambda function, este archivo contiene las librerias ```boto3``` (AWS SDK para python) y ```fpdf``` (para crear archivos pdf)

En estos 3 pasos, ya es posible probar la lambda function con los parametros correspondientes.
