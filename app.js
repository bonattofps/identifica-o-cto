const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz40yerzLcYsbRSwGD0RCzaQ8sv19KcItBrYJUKNIO2HxZlql9ZV2S5VVSlcexyav1t/exec";

let dados = [];

// ===== FORMATA LINK =====
function formatarLink(url){
  if(!url) return "#";
  if(!url.startsWith("http")){
    return "https://" + url;
  }
  return url;
}

// ===== RESUMO =====
function gerarResumo(){
  resumo.value =
  `OLT: ${olt.value} | SLOT/PON: ${pon.value} | Técnico: ${tecnico.value} | Suporte: ${suporte.value} | Evidência: ${link.value}`;
}

document.querySelectorAll("#olt,#pon,#tecnico,#suporte,#link")
.forEach(e=>e.addEventListener("input", gerarResumo));

// ===== COPIAR =====
function copiar(){
  navigator.clipboard.writeText(resumo.value);
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
    "&obs=" + encodeURIComponent(obs.value) +
    "&link=" + encodeURIComponent(link.value) +
    "&resumo=" + encodeURIComponent(resumo.value);

  const res = await fetch(url);
  const json = await res.json();

  if(json.status === "sucesso"){
    alert("Salvo!");
    limpar();
    carregar();
  }
}

// ===== CARREGAR =====
async function carregar(){

  const res = await fetch(SCRIPT_URL);
  dados = await res.json();

  atualizarTabela(dados);

  total.innerText = dados.length;
  olts.innerText = new Set(dados.map(d=>d[1])).size;
  tecnicos.innerText = new Set(dados.map(d=>d[3])).size;
}

// ===== TABELA =====
function atualizarTabela(lista){

  tabela.innerHTML = "";

  lista.reverse().forEach(r => {

    tabela.innerHTML += `
    <tr>
      <td>${r[0]}</td>
      <td>${r[1]}</td>
      <td>${r[2]}</td>
      <td>${r[3]}</td>
      <td>${r[4]}</td>
      <td>${r[5]}</td>
      <td><a href="${formatarLink(r[6])}" target="_blank">🔗 Abrir</a></td>
      <td>${r[7]}</td>
    </tr>`;
  });
}

// ===== BUSCA =====
function buscar(txt){
  const filtrado = dados.filter(d =>
    d.join(" ").toLowerCase().includes(txt.toLowerCase())
  );
  atualizarTabela(filtrado);
}

// ===== LIMPAR =====
function limpar(){
  olt.value="";
  pon.value="";
  tecnico.value="";
  suporte.value="";
  obs.value="";
  link.value="";
  resumo.value="";
}

// ===== NAV =====
function show(id){
  document.querySelectorAll("section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
}

carregar();
