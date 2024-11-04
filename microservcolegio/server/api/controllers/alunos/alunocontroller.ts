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