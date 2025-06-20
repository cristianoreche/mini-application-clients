INSTRUÇÕES PARA EXECUTAR O PROJETO LOCALMENTE

1. Descompacte todos os arquivos do projeto em uma pasta local.
2. Abra o arquivo index.html diretamente no navegador (recomendado: Google Chrome).
3. Na tela de login:
   - Cadastre um novo usuário (caso ainda não exista).
   - Ou faça login com um usuário já existente.
4. Após o login, você será redirecionado automaticamente para a tela principal de clientes.
5. Na interface:
   - Cadastre clientes.
   - Acesse a seção de endereços para vincular múltiplos endereços a um cliente, marcando um como principal.
6. Utilize a opção "Exportar Banco" para salvar os dados locais em um arquivo JSON.
7. Para reutilizar dados anteriores, utilize a opção "Importar Banco" (disponível na tela de login) para carregar um arquivo JSON previamente exportado.

ESTRUTURA DO PROJETO

A organização das pastas foi feita para refletir boas práticas de escalabilidade e manutenibilidade:

/index.html                ← Página de login
/pages/
  └── dashboard.html       ← Tela principal do sistema (clientes e endereços)
/assets/
  /css/
    └── main.css           ← Estilos principais (seguindo metodologia BEM)
  /js/
    ├── script.js          ← Lógica principal da aplicação
    ├── validator.js       ← Máscaras e validações (ex: CPF, telefone)
    ├── viacep.js          ← Integração com a API ViaCEP
    └── lucide-init.js     ← Inicialização dos ícones da biblioteca Lucide
/alasql.min.js             ← Biblioteca SQL em JavaScript

POR QUE NÃO É NECESSÁRIO UM SERVIDOR?

Este projeto foi desenvolvido com JavaScript puro (Vanilla) utilizando a biblioteca alasql.js, que cria um banco de dados SQL diretamente na memória do navegador (LocalStorage). Isso permite que toda a aplicação funcione 100% no navegador, sem necessidade de backend ou servidores.

METODOLOGIA BEM NO CSS

A metodologia BEM (Block Element Modifier) foi adotada para garantir:
- Organização e escalabilidade do CSS.
- Facilidade na leitura e manutenção de estilos.
- Evita conflitos entre classes ao longo do projeto.

Exemplos:
.field__input      ← elemento “input” do bloco “form”
.alert--success   ← variação (modifier) do bloco “alert”
