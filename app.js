const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz40yerzLcYsbRSwGD0RCzaQ8sv19KcItBrYJUKNIO2HxZlql9ZV2S5VVSlcexyav1t/exec";

let dados = [];

// ===== RESUMO AUTOMÁTICO =====
function gerarResumo(){
  const texto = `OLT: ${olt.value} | SLOT/PON: ${pon.value} | Técnico: ${tecnico.value} | Suporte: ${suporte.value} | Evidência: ${link.value}`;
  resumoAuto.value = texto;
}

document.querySelectorAll("#olt,#pon,#tecnico,#suporte,#link")
.forEach(el => el.addEventListener("input", gerarResumo));

// ===== COPIAR =====
function copiarResumo(){
  navigator.clipboard.writeText(resumoAuto.value);
  alert("Resumo copiado!");
}

// ===== SALVAR =====
async function salvar(){

  const url =
    SCRIPT_URL +
    "?acao=salvar" +
    "&olt=" + encodeURIComponent(olt.value) +
    "&pon=" + encodeURIComponent(pon.value) +
    "&tecnico=" + encodeURIComponent(tecnico.value) +
    "&suporte=" + encodeURIComponent(suporte.value) +
    "&link=" + encodeURIComponent(link.value) +
    "&resumo=" + encodeURIComponent(resumoAuto.value);

  await fetch(url);

  alert("Salvo!");
  carregar();
}

// ===== CARREGAR =====
async function carregar(){

  const res = await fetch(SCRIPT_URL);
  dados = await res.json();

  atualizarTabela(dados);
  atualizarDashboard(dados);
}

// ===== TABELA =====
function atualizarTabela(lista){

  const tabela = document.getElementById("tabela");
  tabela.innerHTML = "";

  lista.reverse().forEach(r => {
    tabela.innerHTML += `
      <tr>
        <td>${r[0]}</td>
        <td>${r[1]}</td>
        <td>${r[2]}</td>
        <td>${r[3]}</td>
        <td>${r[4]}</td>
        <td><a href="${r[7]}" target="_blank">Abrir</a></td>
        <td>${r[8]}</td>
      </tr>
    `;
  });
}

// ===== DASHBOARD =====
function atualizarDashboard(data){

  document.getElementById("total").innerText = data.length;

  const olts = new Set(data.map(d => d[1]));
  const tec = new Set(data.map(d => d[3]));

  document.getElementById("oltCount").innerText = olts.size;
  document.getElementById("tecCount").innerText = tec.size;
}

// ===== BUSCA =====
function buscar(texto){
  const filtrado = dados.filter(d =>
    d.join(" ").toLowerCase().includes(texto.toLowerCase())
  );
  atualizarTabela(filtrado);
}

// ===== EXCEL =====
function importarExcel(e){

  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(evt){
    const wb = XLSX.read(evt.target.result, {type:"binary"});
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws);

    json.forEach(row => {
      console.log(row);
    });

    alert("Importado!");
  };

  reader.readAsBinaryString(file);
}

// ===== NAV =====
function mostrar(id){
  document.querySelectorAll("section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
}

carregar();