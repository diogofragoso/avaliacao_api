import Cors from 'cors';

// Configuração do middleware CORS
const cors = Cors({
  origin: '*',                 // Permite qualquer origem (para produção, restrinja)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos, incluindo OPTIONS
});

// Função auxiliar para executar o middleware Cors com Promises
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

export default runMiddleware;
