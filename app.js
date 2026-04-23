const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz40yerzLcYsbRSwGD0RCzaQ8sv19KcItBrYJUKNIO2HxZlql9ZV2S5VVSlcexyav1t/exec";

let dados = [];
let paginaAtual = 1;
const itensPorPagina = 5;

// ===== ELEMENTOS PRINCIPAIS =====
const olt = document.getElementById("olt");
const pon = document.getElementById("pon");
const tecnico = document.getElementById("tecnico");
const suporte = document.getElementById("suporte");
const obs = document.getElementById("obs");
const link = document.getElementById("link");
const resumo = document.getElementById("resumo");

const total = document.getElementById("total");
const olts = document.getElementById("olts");
const tecnicos = document.getElementById("tecnicos");
const tabela = document.getElementById("tabela");
const paginaInfo = document.getElementById("paginaInfo");

// ===== FILTROS =====
const filtroTecnico = document.getElementById("filtroTecnico");
const filtroOLT = document.getElementById("filtroOLT");
const filtroSuporte = document.getElementById("filtroSuporte");
const filtroPON = document.getElementById("filtroPON");

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

// atualização automática do resumo
[olt, pon, tecnico, suporte, link].forEach(el => {
  el.addEventListener("input", gerarResumo);
});

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
  olts.innerText = new Set(dados.map(d => d[1])).size;
  tecnicos.innerText = new Set(dados.map(d => d[3])).size;

  paginaAtual = 1;
  renderTabela();
}

//
// 🔎 FILTROS AVANÇADOS
//
function aplicarFiltros(){

  const tecnicoF = filtroTecnico.value.toLowerCase();
  const oltF = filtroOLT.value.toLowerCase();
  const suporteF = filtroSuporte.value.toLowerCase();
  const ponF = filtroPON.value.toLowerCase();

  return dados.filter(d => {

    const data = {
      olt: (d[1] || "").toLowerCase(),
      pon: (d[2] || "").toLowerCase(),
      tecnico: (d[3] || "").toLowerCase(),
      suporte: (d[4] || "").toLowerCase()
    };

    return (
      (!tecnicoF || data.tecnico.includes(tecnicoF)) &&
      (!oltF || data.olt.includes(oltF)) &&
      (!suporteF || data.suporte.includes(suporteF)) &&
      (!ponF || data.pon.includes(ponF))
    );
  });
}

//
// 📊 TABELA
//
function renderTabela(){

  const filtrado = aplicarFiltros();

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  const paginaDados = filtrado.slice(inicio, fim);

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

  paginaInfo.innerText = `Página ${paginaAtual} - ${filtrado.length} registros`;
}

//
// ⬅➡ PAGINAÇÃO
//
function proxima(){
  const filtrado = aplicarFiltros();

  if((paginaAtual * itensPorPagina) < filtrado.length){
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
// 🔄 FILTROS EM TEMPO REAL
//
[filtroTecnico, filtroOLT, filtroSuporte, filtroPON].forEach(el => {
  el.addEventListener("input", () => {
    paginaAtual = 1;
    renderTabela();
  });
});

//
// 🧹 LIMPAR
//
function limpar(){
  olt.value = "";
  pon.value = "";
  tecnico.value = "";
  suporte.value = "";
  obs.value = "";
  link.value = "";
  resumo.value = "";
}

carregar();
