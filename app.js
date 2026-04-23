const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz40yerzLcYsbRSwGD0RCzaQ8sv19KcItBrYJUKNIO2HxZlql9ZV2S5VVSlcexyav1t/exec";

let dados = [];
let paginaAtual = 1;
const itensPorPagina = 5;

// ===== FORMATAR DATA =====
function formatarData(dataISO){
  const d = new Date(dataISO);
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  });
}

// ===== FORMATAR LINK =====
function formatarLink(url){
  if(!url) return "#";
  if(!url.startsWith("http")){
    return "https://" + url;
  }
  return url;
}

//
// 🔥 RESUMO AUTOMÁTICO
//
function gerarResumo(){
  resumo.value =
  `📡 CTO IDENTIFICAÇÃO
OLT: ${olt.value}
PON: ${pon.value}
Técnico: ${tecnico.value}
Suporte: ${suporte.value}
Evidência: ${link.value}`;
}

// atualiza automaticamente
document.querySelectorAll("#olt,#pon,#tecnico,#suporte,#link")
.forEach(e => e.addEventListener("input", gerarResumo));

//
// 📋 COPIAR RESUMO
//
function copiarResumo(){
  navigator.clipboard.writeText(resumo.value);
  alert("Resumo copiado!");
}

//
// 💾 SALVAR
//
async function salvar(){

  const url =
    SCRIPT_URL +
    "?acao=salvar" +
    "&olt=" + encodeURIComponent(olt.value) +
    "&pon=" + encodeURIComponent(pon.value) +
    "&tecnico=" + encodeURIComponent(tecnico.value) +
    "&suporte=" + encodeURIComponent(suporte.value) +
    "&obs=" + encodeURIComponent(obs.value) +
    "&link=" + encodeURIComponent(link.value);

  await fetch(url);

  limpar();
  carregar();
}

//
// 📥 CARREGAR
//
async function carregar(){

  const res = await fetch(SCRIPT_URL);
  dados = await res.json();

  dados.reverse();

  total.innerText = dados.length;
  olts.innerText = new Set(dados.map(d=>d[1])).size;
  tecnicos.innerText = new Set(dados.map(d=>d[3])).size;

  paginaAtual = 1;
  renderTabela();
}

//
// 📊 TABELA COM PAGINAÇÃO
//
function renderTabela(){

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  const paginaDados = dados.slice(inicio, fim);

  tabela.innerHTML = "";

  paginaDados.forEach(r => {

    tabela.innerHTML += `
    <tr>
      <td>${formatarData(r[0])}</td>
      <td>${r[1]}</td>
      <td>${r[2]}</td>
      <td>${r[3]}</td>
      <td>${r[4]}</td>
      <td>${r[5]}</td>
      <td><a href="${formatarLink(r[6])}" target="_blank">🔗 Abrir</a></td>
    </tr>`;
  });

  paginaInfo.innerText = `Página ${paginaAtual}`;
}

//
// ⬅➡ PAGINAÇÃO
//
function proxima(){
  if((paginaAtual * itensPorPagina) < dados.length){
    paginaAtual++;
    renderTabela();
  }
}

function anterior(){
  if(paginaAtual > 1){
    paginaAtual--;
    renderTabela();
  }
}

//
// 🔎 BUSCA
//
function buscar(txt){
  const filtrado = dados.filter(d =>
    d.join(" ").toLowerCase().includes(txt.toLowerCase())
  );

  tabela.innerHTML = "";

  filtrado.forEach(r => {
    tabela.innerHTML += `
    <tr>
      <td>${formatarData(r[0])}</td>
      <td>${r[1]}</td>
      <td>${r[2]}</td>
      <td>${r[3]}</td>
      <td>${r[4]}</td>
      <td>${r[5]}</td>
      <td><a href="${formatarLink(r[6])}" target="_blank">🔗 Abrir</a></td>
    </tr>`;
  });
}

//
// 🧹 LIMPAR
//
function limpar(){
  olt.value="";
  pon.value="";
  tecnico.value="";
  suporte.value="";
  obs.value="";
  link.value="";
  resumo.value="";
}

carregar();
