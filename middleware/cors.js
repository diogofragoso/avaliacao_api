import Cors from 'cors';

// Configuração do middleware CORS
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  origin: '*',
});

// Função auxiliar para rodar o middleware
function runMiddleware(req, res) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Exporta a função de execução do middleware
export default runMiddleware;
