// Criação das tabelas
alasql(
  "CREATE TABLE IF NOT EXISTS usuarios (nome STRING UNIQUE, senha STRING)"
);
alasql(
  "CREATE TABLE IF NOT EXISTS clientes (cpf STRING UNIQUE, nome STRING, nascimento DATE, telefone STRING, celular STRING)"
);
alasql(
  "CREATE TABLE IF NOT EXISTS enderecos (id INT AUTO_INCREMENT, cep STRING, rua STRING, bairro STRING, cidade STRING, estado STRING, pais STRING, clienteCpf STRING, principal BOOLEAN)"
);

// ALERTA
function showAlert(msg, type = "info") {
  const alertBox = document.getElementById("alertBox");
  if (!alertBox) return;
  alertBox.textContent = msg;
  alertBox.className = `alert alert--${type} alert--show`;
  setTimeout(() => alertBox.classList.remove("alert--show"), 3000);
}

// LOGIN
function fazerLogin() {
  const user = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const ok = alasql("SELECT * FROM usuarios WHERE nome=? AND senha=?", [
    user,
    senha,
  ]);
  if (ok.length) {
    localStorage.setItem("logado", "1");
    window.location.href = "pages/dashboard.html";
  } else {
    showAlert("Usuário ou senha inválido", "error");
  }
}

// CADASTRO SIMPLIFICADO (PARA TESTES)
function cadastrarUsuario() {
  const user = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Validações básicas
  if (!user || !senha) {
    showAlert("Preencha todos os campos", "error");
    return;
  }

  if (user.length < 3) {
    showAlert("Usuário precisa ter pelo menos 3 caracteres", "error");
    return;
  }

  // Verifica se usuário já existe
  if (alasql("SELECT * FROM usuarios WHERE nome = ?", [user]).length > 0) {
    showAlert("Usuário já existe", "error");
    return;
  }

  // Cadastra o usuário (senha em texto plano - APENAS PARA TESTES)
  alasql("INSERT INTO usuarios VALUES (?, ?)", [user, senha]);

  // Atualiza localStorage
  localStorage.setItem(
    "usuarios",
    JSON.stringify(alasql("SELECT * FROM usuarios"))
  );

  showAlert("Cadastro realizado! Redirecionando...", "success");

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1500);
}

// Função para salvar TODOS os dados no localStorage
function salvarBancoLocal() {
  const data = {
    usuarios: alasql("SELECT * FROM usuarios"),
    clientes: alasql("SELECT * FROM clientes"),
    enderecos: alasql("SELECT * FROM enderecos"),
    ultimoBackup: new Date().toISOString(),
  };
  localStorage.setItem("appDatabase", JSON.stringify(data));
}

// Função para carregar TODOS os dados do localStorage
function carregarBancoLocal() {
  const savedData = localStorage.getItem("appDatabase");
  if (savedData) {
    const data = JSON.parse(savedData);

    // Limpa as tabelas existentes
    alasql("DELETE FROM usuarios");
    alasql("DELETE FROM clientes");
    alasql("DELETE FROM enderecos");

    // Insere os dados salvos
    if (data.usuarios) {
      data.usuarios.forEach((user) => {
        alasql("INSERT INTO usuarios VALUES (?, ?)", [user.nome, user.senha]);
      });
    }

    if (data.clientes) {
      data.clientes.forEach((cliente) => {
        alasql("INSERT INTO clientes VALUES (?, ?, ?, ?, ?)", [
          cliente.cpf,
          cliente.nome,
          cliente.nascimento,
          cliente.telefone,
          cliente.celular,
        ]);
      });
    }

    if (data.enderecos) {
      data.enderecos.forEach((endereco) => {
        alasql("INSERT INTO enderecos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
          endereco.id,
          endereco.cep,
          endereco.rua,
          endereco.bairro,
          endereco.cidade,
          endereco.estado,
          endereco.pais,
          endereco.clienteCpf,
          endereco.principal,
        ]);
      });
    }

    return true;
  }
  return false;
}

// Atualizar contadores no dashboard
function atualizarContadores() {
  if (!document.getElementById("totalUsuarios")) return;

  document.getElementById("totalUsuarios").textContent = alasql(
    "SELECT COUNT(*) FROM usuarios"
  )[0]["COUNT(*)"];
  document.getElementById("totalClientes").textContent = alasql(
    "SELECT COUNT(*) FROM clientes"
  )[0]["COUNT(*)"];
  document.getElementById("totalEnderecos").textContent = alasql(
    "SELECT COUNT(*) FROM enderecos"
  )[0]["COUNT(*)"];
}

// EXPORTAR BANCO
function exportarBanco() {
  const data = {
    usuarios: alasql("SELECT * FROM usuarios"),
    clientes: alasql("SELECT * FROM clientes"),
    enderecos: alasql("SELECT * FROM enderecos"),
    ultimoBackup: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();

  showAlert("Banco exportado com sucesso", "success");
}

// IMPORTAR BANCO
function importarBanco() {
  const input = document.getElementById("uploadDB");
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Limpa as tabelas existentes
      alasql("DELETE FROM usuarios");
      alasql("DELETE FROM clientes");
      alasql("DELETE FROM enderecos");

      // Insere os novos dados
      if (data.usuarios) {
        data.usuarios.forEach((user) => {
          alasql("INSERT INTO usuarios VALUES (?, ?)", [user.nome, user.senha]);
        });
      }

      if (data.clientes) {
        data.clientes.forEach((cliente) => {
          alasql("INSERT INTO clientes VALUES (?, ?, ?, ?, ?)", [
            cliente.cpf,
            cliente.nome,
            cliente.nascimento,
            cliente.telefone,
            cliente.celular,
          ]);
        });
      }

      if (data.enderecos) {
        data.enderecos.forEach((endereco) => {
          alasql("INSERT INTO enderecos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            endereco.id,
            endereco.cep,
            endereco.rua,
            endereco.bairro,
            endereco.cidade,
            endereco.estado,
            endereco.pais,
            endereco.clienteCpf,
            endereco.principal,
          ]);
        });
      }

      // Salva no localStorage
      salvarBancoLocal();

      showAlert("Banco importado com sucesso!", "success");
      input.value = "";

      // Atualiza a interface se estiver no dashboard
      if (typeof atualizarContadores === "function") {
        atualizarContadores();
      }
    } catch (error) {
      showAlert("Erro ao importar o banco: " + error.message, "error");
    }
  };

  reader.readAsText(file);
}

// LOGOUT
function logout() {
  localStorage.removeItem("logado"); // Remove apenas o status de login
  window.location.href = "../index.html";
}

// PROTEÇÃO
document.addEventListener("DOMContentLoaded", () => {
  // Carrega os dados salvos
  carregarBancoLocal();

  const protegido = ["clientes.html", "enderecos.html", "dashboard.html"];
  const pagina = location.pathname.split("/").pop();
  if (protegido.includes(pagina) && localStorage.getItem("logado") !== "1") {
    window.location.href = "../index.html";
  }

  // Restaurar usuários ao iniciar (login)
  const usuariosSalvos = localStorage.getItem("usuarios");
  if (usuariosSalvos && alasql("SELECT * FROM usuarios").length === 0) {
    alasql.tables.usuarios.data = JSON.parse(usuariosSalvos);
  }

  // Cliente
  const formCliente = document.getElementById("formCliente");
  if (formCliente) {
    formCliente.onsubmit = (e) => {
      e.preventDefault();

      // Obtém e limpa os valores
      const cpf = document.getElementById("cpf").value.trim();
      const nome = document.getElementById("nome").value.trim();
      const nascimento = document.getElementById("nascimento").value;
      const telefone = document.getElementById("telefone").value.trim();
      const celular = document.getElementById("celular").value.trim();

      // Validações
      if (!validarCPF(cpf)) {
        showAlert("CPF inválido", "error");
        return;
      }

      if (nome.length < 3) {
        showAlert("Nome deve ter pelo menos 3 caracteres", "error");
        return;
      }

      if (alasql("SELECT * FROM clientes WHERE cpf=?", [cpf]).length > 0) {
        showAlert("CPF já cadastrado", "error");
        return;
      }

      // Insere no banco de dados
      alasql("INSERT INTO clientes VALUES (?,?,?,?,?)", [
        cpf,
        nome,
        nascimento,
        telefone,
        celular,
      ]);

      // SALVA NO LOCALSTORAGE (PERSISTÊNCIA)
      salvarBancoLocal();

      // Atualiza a interface
      formCliente.reset();
      listarClientes();
      showAlert("Cliente cadastrado com sucesso!", "success");
    };

    listarClientes();
  }

  // Configura o formulário de endereço
  const formEndereco = document.getElementById("formEndereco");
  if (formEndereco) {
    formEndereco.onsubmit = (e) => {
      e.preventDefault();

      const cpf = document.getElementById("clienteId").value.trim();

      // Verifica se o cliente existe
      if (!alasql("SELECT * FROM clientes WHERE cpf = ?", [cpf]).length) {
        showAlert("Cliente não encontrado", "error");
        return;
      }

      // Se for endereço principal, desmarca outros
      if (document.getElementById("principal").checked) {
        alasql("UPDATE enderecos SET principal = FALSE WHERE clienteCpf = ?", [
          cpf,
        ]);
      }

      // Insere o novo endereço
      alasql("INSERT INTO enderecos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        undefined, // id auto-increment
        document.getElementById("cep").value,
        document.getElementById("rua").value,
        document.getElementById("bairro").value,
        document.getElementById("cidade").value,
        document.getElementById("estado").value,
        document.getElementById("pais").value,
        cpf,
        document.getElementById("principal").checked,
      ]);

      // Salva no localStorage
      salvarBancoLocal();

      // Atualiza a interface
      formEndereco.reset();
      listarEnderecos();
      showAlert("Endereço cadastrado com sucesso!", "success");
    };

    listarEnderecos();
  }

  // Máscaras e CEP
  if (document.getElementById("cpf"))
    aplicarMascara(document.getElementById("cpf"), "cpf");
  if (document.getElementById("celular"))
    aplicarMascaraTelefone(document.getElementById("celular"));
  if (document.getElementById("telefone"))
    aplicarMascaraTelefone(document.getElementById("telefone"));
  if (document.getElementById("cep")) {
    document.getElementById("cep").addEventListener("blur", () => {
      consultarCEP(document.getElementById("cep").value);
    });
  }
});

// CADASTRO DE CLIENTE (PERSISTENTE)
function cadastrarCliente(e) {
  e.preventDefault();

  const cpf = document.getElementById("cpf").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const nascimento = document.getElementById("nascimento").value;
  const telefone = document.getElementById("telefone").value.trim();
  const celular = document.getElementById("celular").value.trim();

  // Validações
  if (!validarCPF(cpf)) {
    showAlert("CPF inválido", "error");
    return;
  }

  if (nome.length < 3) {
    showAlert("Nome deve ter pelo menos 3 caracteres", "error");
    return;
  }

  if (alasql("SELECT * FROM clientes WHERE cpf = ?", [cpf]).length > 0) {
    showAlert("CPF já cadastrado", "error");
    return;
  }

  // Insere no banco SQL
  alasql("INSERT INTO clientes VALUES (?, ?, ?, ?, ?)", [
    cpf,
    nome,
    nascimento,
    telefone,
    celular,
  ]);

  // SALVA TODOS OS DADOS (incluindo clientes)
  salvarBancoLocal();

  // Feedback e limpeza
  showAlert("Cliente cadastrado com sucesso!", "success");
  document.getElementById("formCliente").reset();
  listarClientes();
}

// Lista de clientes
function listarClientes() {
  const busca =
    document.getElementById("buscaCliente")?.value.toLowerCase() || "";
  const lista = document.getElementById("listaClientes");
  if (!lista) return;

  const clientes = alasql("SELECT * FROM clientes").filter(
    (c) => c.nome.toLowerCase().includes(busca) || c.cpf.includes(busca)
  );

  const enderecos = alasql("SELECT * FROM enderecos");

  lista.innerHTML = clientes
    .map((c) => {
      const enderecosCliente = enderecos.filter((e) => e.clienteCpf === c.cpf);
      const enderecoList = enderecosCliente.length
        ? "<ul>" +
          enderecosCliente
            .map(
              (e) =>
                `<li>${e.rua}, ${e.bairro} - ${e.cidade}/${e.estado} ${
                  e.principal ? "⭐" : ""
                }</li>`
            )
            .join("") +
          "</ul>"
        : "<em>Nenhum</em>";

      return `
        <tr>
          <td>${c.nome}</td>
          <td>${c.cpf}</td>
          <td>${c.celular}</td>
          <td>${enderecoList}</td>
        </tr>
      `;
    })
    .join("");
}

// Lista de endereços
function listarEnderecos() {
  const busca =
    document.getElementById("buscaEndereco")?.value.toLowerCase() || "";
  const lista = document.getElementById("listaEnderecos");
  if (!lista) return;

  const enderecos = alasql(`
    SELECT e.*, c.nome as clienteNome 
    FROM enderecos e
    LEFT JOIN clientes c ON e.clienteCpf = c.cpf
  `).filter(
    (e) =>
      e.clienteNome.toLowerCase().includes(busca) ||
      e.clienteCpf.includes(busca) ||
      e.rua.toLowerCase().includes(busca) ||
      e.cep.includes(busca)
  );

  lista.innerHTML = enderecos
    .map(
      (e) => `
    <tr>
      <td>${e.clienteNome} (${e.clienteCpf})</td>
      <td>${e.rua}, ${e.bairro}</td>
      <td>${e.cidade}/${e.estado}</td>
      <td>${e.principal ? "⭐" : ""}</td>
      <td>
        <button onclick="removerEndereco(${e.id})" class="small-button danger">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    </tr>
  `
    )
    .join("");

  if (window.lucide) lucide.createIcons();
}

function removerEndereco(id) {
  if (confirm("Tem certeza que deseja remover este endereço?")) {
    alasql("DELETE FROM enderecos WHERE id = ?", [id]);
    salvarBancoLocal();
    listarEnderecos();
    showAlert("Endereço removido", "success");
  }
}

// VISUALIZAR SENHA
function toggleSenha(id) {
  const input = document.getElementById(id);
  const icon = document.getElementById(`toggleIcon-${id}`);

  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";

  if (icon) {
    icon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
    if (window.lucide) lucide.createIcons();
  }
}
