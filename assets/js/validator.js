// Máscara de CPF
function aplicarMascara(input, tipo) {
  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, "");

    if (tipo === "cpf") {
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    if (tipo === "cep") {
      valor = valor.replace(/(\\d{5})(\\d{1,3})/, "$1-$2");
    }

    if (tipo === "telefone") {
      if (valor.length <= 10) {
        valor = valor.replace(/(\\d{2})(\\d{4})(\\d{0,4})/, "($1) $2-$3");
      } else {
        valor = valor.replace(/(\\d{2})(\\d{5})(\\d{0,4})/, "($1) $2-$3");
      }
    }

    input.value = valor;
  });
}

// Validação de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0,
    resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}

function aplicarMascaraTelefone(input) {
  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, "");

    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length >= 11) {
      // Formato celular com 9 dígitos: (00) 00000-0000
      valor = valor.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (valor.length >= 10) {
      // Telefone fixo: (00) 0000-0000
      valor = valor.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else if (valor.length >= 6) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (valor.length >= 3) {
      valor = valor.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else if (valor.length > 0) {
      valor = valor.replace(/^(\d*)/, "($1");
    }

    input.value = valor;
  });
}
