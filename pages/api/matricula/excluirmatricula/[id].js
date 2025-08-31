import db from '../../../db.js';
import runMiddleware from '../../../../middleware/cors.js';

export default async function handler(req, res) {
    await runMiddleware(req, res);

    const { id } = req.query; // id_matricula

    if (req.method === 'DELETE') {
        try {
            // Desestruturando corretamente
            const resultado = await db.execute(
                `DELETE FROM matricula WHERE id_matricula = ?`,
                [id]
            );

            console.log(resultado); // <--- adicione isso


            if (resultado.affectedRows === 0) {
                return res.status(404).json({ error: 'Matrícula não encontrada' });
            }

            res.status(200).json({ mensagem: 'Matrícula excluída com sucesso!' });
        } catch (error) {
            console.error('Erro ao excluir matrícula:', error);
            res.status(500).json({
                error: 'Erro ao excluir matrícula',
                details: error.message,
            });
        }
    } else {
        res.status(405).json({ error: 'Método não permitido :-(' });
    }
}
