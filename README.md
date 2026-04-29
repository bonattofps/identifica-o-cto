# Painel Gerador de Logins

Sistema web estatico para cadastro de CTO, geracao de logins PPPoE com sufixo `_UNI` e envio automatico para uma planilha do Google Sheets via Google Apps Script.

O resumo automatico fica apenas no painel para o suporte copiar. Ele nao e enviado para a planilha.

## Arquivos

- `index.html`: tela principal do painel.
- `styles.css`: visual neon inspirado nas referencias.
- `script.js`: regras do cadastro, historico local, resumo automatico e gerador de logins.
- `apps-script/Code.gs`: codigo para colar no Google Apps Script da planilha.

## Configurar Google Sheets

1. Crie uma planilha no Google Drive.
2. Na planilha, abra `Extensoes > Apps Script`.
3. Cole o conteudo de `apps-script/Code.gs`.
4. Salve o projeto.
5. Clique em `Implantar > Nova implantacao`.
6. Selecione `Aplicativo da Web`.
7. Em `Executar como`, escolha `Eu`.
8. Em `Quem pode acessar`, escolha `Qualquer pessoa`.
9. Implante, autorize e copie a URL do Web App.
10. Abra `script.js` e cole a URL em `appsScriptUrl`.

Sempre que alterar o arquivo `apps-script/Code.gs`, publique uma nova versao em `Implantar > Gerenciar implantacoes > Editar > Nova versao`. Se nao fizer isso, o Web App continua rodando o codigo antigo.

Para testar se o Apps Script esta conectado na planilha certa, abra a URL do Web App no navegador. A resposta deve mostrar `ok: true`, o nome da planilha, o nome da aba e a quantidade de linhas.

Exemplo:

```js
const CONFIG = {
  appsScriptUrl: "https://script.google.com/macros/s/SEU_ID/exec",
  storageKey: "painel-gerador-logins:v1"
};
```

## Hospedar no GitHub Pages

1. Crie um repositorio no GitHub.
2. Envie estes arquivos para a branch `main`.
3. No repositorio, abra `Settings > Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione `main` e a pasta `/root`.
6. Salve e aguarde o link do GitHub Pages.

## Observacao importante

O painel salva uma copia do historico no navegador para consulta rapida. Quando `appsScriptUrl` estiver configurado, cada envio tambem sera gravado na planilha do Google Drive.
