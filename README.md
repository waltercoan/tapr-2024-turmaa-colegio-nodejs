# tapr-2024-turmaa-colegio-nodejs

## Documentação do projeto
[Diagramas](https://univillebr-my.sharepoint.com/:u:/g/personal/walter_s_univille_br/EbLNg-hQDmdIjM6sIIFvjA0BHpsa_cRHPT0BpNIaea0yXw?e=tPsYS0)

## Extensões do VSCode
[JavaScript and TypeScript Nightly](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next?wt.mc_id=AZ-MVP-5003638)

[Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client?wt.mc_id=AZ-MVP-5003638)

## Criação do projeto
```
npm install -g yo generator-express-no-stress-typescript
yo express-no-stress-typescript
```
- Nome do projeto: microserv<nome do subdomínio>

1. Criar uma pasta com o nome de cada Bounded Context
2. Criar uma subpasta chamado entities e dentro dele criar as entidades
```
.
├── api
│   ├── controllers
│   │   └── examples
│   │       ├── controller.ts
│   │       └── router.ts
│   ├── middlewares
│   │   └── error.handler.ts
│   ├── secretaria
│   │   └── entities
│   │       └── aluno.ts
│   └── services
│       └── examples.service.ts
```

## Cosmos DB
[Introdução (https://learn.microsoft.com/en-us/azure/cosmos-db/introduction?wt.mc_id=AZ-MVP-5003638)](https://learn.microsoft.com/en-us/azure/cosmos-db/introduction?wt.mc_id=AZ-MVP-5003638)

[Databases, Containers e Itens (https://learn.microsoft.com/en-us/azure/cosmos-db/resource-model?wt.mc_id=AZ-MVP-5003638)](https://learn.microsoft.com/en-us/azure/cosmos-db/resource-model?wt.mc_id=AZ-MVP-5003638)

```
docker run \
    --publish 8081:8081 \
    --publish 10250-10255:10250-10255 \
    --name cosmosdb-linux-emulator \
    --detach \
    mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest    
```
### Instalação do certificado
```
curl --insecure https://localhost:8081/_explorer/emulator.pem > ~/emulatorcert.crt
```
```
sudo cp ~/emulatorcert.crt /usr/local/share/ca-certificates/
```
```
sudo update-ca-certificates
```
### IMPORTANTE: nas configurações do CodeSpace desabilitar a opção http.proxyStrictSSL

### Extensão do VSCode
[Azure Databases](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-cosmosdb?wt.mc_id=AZ-MVP-5003638)
### Endpoint do simulador
```
AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==;
```

### Modelagem de dados
[Modeling Data](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/modeling-data?wt.mc_id=AZ-MVP-5003638)

### Particionamento
[Partitioning](https://learn.microsoft.com/en-us/azure/cosmos-db/partitioning-overview?wt.mc_id=AZ-MVP-5003638)

### Instalar os módulos para conectar no CosmosDB

```
npm install @azure/cosmos
npm install @azure/identity
```

### Correções 04/11/2024
- Incluir as variáveis de ambiente dentro o arquivo .env na pasta microservcolegio
```
COSMOSDBURL=https://localhost:8081/
COSMOSDBKEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
COSMOSDBDB=dbcolegio
NODE_TLS_REJECT_UNAUTHORIZED = 0
```

## CRUD API REST
- [Documentação oficial da API do CosmosDB para JS](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/cosmosdb/cosmos#azure-cosmos-db-client-library-for-javascripttypescript)

### Verbo GET e POST
- Objetivo: Retornar uma lista de objetos ou um objeto específico a partir da chave, e salvar um novo aluno


#### api.yml
- Registrar os enpoints na documentação da API (dentro do item paths:)
```
  /alunos:
    get:
      responses:
        200:
          description: Returns all
          content: {}
    post:
      responses:
          200:
            description: Return all
            content: {} 
```


#### microservcolegio/server/api/secretaria/services/alunoservice.ts
```
import { Container, SqlQuerySpec } from "@azure/cosmos"
import cosmosDb from "../../../common/cosmosdb"
import { Aluno } from "../entities/aluno"


class AlunoService{
    private container:Container =
        cosmosDb.container("aluno")

    async all(): Promise<Aluno[]>{
        const {resources: listaAlunos}
            = await this.container.items.readAll<Aluno>().fetchAll()
        return Promise.resolve(listaAlunos)
    }
    async saveNew(aluno:Aluno): Promise<Aluno>{
        aluno.id = ""
        await this.container.items.create(aluno);

        return Promise.resolve(aluno);
    }
}


export default new AlunoService();
```

#### controllers/alunos/alunocontroller.ts
- Implememntar no controlador os métodos para buscar do banco todos os alunos e para salvar um novo aluno

```
import {Request, Response} from 'express';
import AlunoService from '../../secretaria/services/alunoservice';


class AlunoController{
    all(_:Request, res:Response): void{
        AlunoService.all().then((a) => res.json(a))
    }
    post(req:Request, res:Response): void{
        if(req.body == undefined)
            res.status(400).end()
        AlunoService.saveNew(req.body).then((a) => res.json(a))
    }
}

export default new AlunoController();
```
#### controllers/alunos/router.ts
- Registrar os endpoints no mecanismo de rotas

```
import express from 'express';
import controller from './alunocontroller';

export default express
    .Router()
    .get('/', controller.all)
    .post('/', controller.post)
```

### Registrar as rotas da API do Aluno no controlador de Rotas geral
```
import { Application } from 'express';
import examplesRouter from './api/controllers/examples/router';
import alunoRouter from './api/controllers/alunos/router'

export default function routes(app: Application): void {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/alunos', alunoRouter)
}
```

#### teste.rest
- Implementação do teste do verbo GET e POST
```
### Buscar todos os alunos
GET http://localhost:3000/api/v1/alunos

### Inserir um aluno
POST http://localhost:3000/api/v1/alunos
Content-Type: application/json

{
    "nome" : "zezinho"
}
```

## Excutar o projeto
```
npm run compile
npm start
```