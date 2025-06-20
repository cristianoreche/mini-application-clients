function consultarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) return;

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        showAlert("CEP não encontrado", "error");
        return;
      }
      document.getElementById("rua").value = data.logradouro || "";
      document.getElementById("bairro").value = data.bairro || "";
      document.getElementById("cidade").value = data.localidade || "";
      document.getElementById("estado").value = data.uf || "";
    })
    .catch(() => showAlert("Erro ao consultar CEP", "error"));
}
