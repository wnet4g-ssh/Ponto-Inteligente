# Ponto Inteligente Manager

Ferramenta para tratamento, unificação e análise de planilhas de ponto.

## Instalação

1.  Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2.  Instale as dependências:
    ```bash
    npm install
    ```

## Desenvolvimento Local

Para rodar o projeto localmente:
```bash
npm run dev
```

## Deploy no GitHub Pages

1.  Verifique se o repositório remoto está configurado.
2.  Execute o comando de deploy:
    ```bash
    npm run deploy
    ```
3.  O script irá construir o projeto (`npm run build`) e enviar a pasta `dist` para o branch `gh-pages`.
4.  Acesse as configurações do repositório no GitHub -> Pages -> Build and deployment -> Source: Deploy from a branch -> Select branch: `gh-pages`.
