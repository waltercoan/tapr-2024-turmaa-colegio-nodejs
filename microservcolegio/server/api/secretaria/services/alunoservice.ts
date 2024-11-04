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